import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {RepositoryService} from "./repository.service";
import {isPlatformBrowser, JsonPipe, NgIf} from "@angular/common";
import {CanvasJSAngularChartsModule} from '@canvasjs/angular-charts';
import {Subscription} from "rxjs";
import {FormsModule} from "@angular/forms";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatCardActions, MatCardHeader, MatCardModule} from "@angular/material/card";
import {MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';


class Trigger {
  url: string;
  threshold: number

  constructor(url: string, threshold: number) {
    this.url = url;
    this.threshold = threshold;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, CanvasJSAngularChartsModule, FormsModule, MatSlideToggle, MatCardModule, MatCardHeader, MatFormFieldModule, MatLabel, MatInputModule, MatButtonModule, MatCardActions, NgIf, MatIconModule, MatListModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  chartOptions: any = {};
  intervalId: any;
  subscription: Subscription | undefined;
  url: string | null = '';
  user: string | null = '';
  password: string | null = '';
  triggers: Trigger[] = []
  intervalMiliSeconds = 300000

  constructor(private repo: RepositoryService, @Inject(PLATFORM_ID) private platformId: any) {


    if (isPlatformBrowser(platformId)) {
      this.url = localStorage.getItem("url")
      this.user = localStorage.getItem("user")
      this.password = localStorage.getItem("password")
      let triggers = localStorage.getItem("triggers")
      if (triggers) {
        this.triggers = JSON.parse(triggers)
      }
      this.load()
      this.intervalId = setInterval(() => {
        this.load()
      }, this.intervalMiliSeconds); // 300,000 ms = 5 minutes
    }
  }

  load(): void {
    this.subscription = this.repo.getData()?.subscribe(data => {
      this.loadData(data)
    })
  }

  saveToLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('url', this.url!);
      localStorage.setItem('user', this.user!);
      localStorage.setItem('password', this.password!);
    }
  }

  syncTriggers(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('triggers', JSON.stringify(this.triggers));
    }
  }

  addTrigger() {
    let trigger = new Trigger("", 0)
    this.triggers.push(trigger)
  }

  removeTrigger() {
    this.triggers.pop()
  }

  trigger(result: any) {

    let now = new Date();
    let window = new Date(now.getTime() - this.intervalMiliSeconds)
    Array.from(result.xAxis).forEach((x, i) => {
      let copy: string = x as string;
      const formattedDateString = copy.replace(' ', 'T');
      const time = new Date(formattedDateString);
      let value = Number.parseFloat(result.productPower[i])
      let totalConsumtion = Number.parseFloat(result.usePower[i])
      if (!Number.isNaN(value)) {
        if (time > window && time < now)
          this.triggers.forEach(trigger => {
            if (( totalConsumtion - value) >= trigger.threshold) {
              this.repo.trigger(trigger.url, "on")?.subscribe((result) => console.log(result))
            } else {
              this.repo.trigger(trigger.url, "off")?.subscribe((result) => console.log(result))
            }
          })

      }
    })
  }

  loadData(data: any) {
    let dpsSolarPanel: any = [];
    let dpsSelfUsePower: any = [];
    let dpsUsePower: any = [];
    let result = data.data;

    this.trigger(result)
    Array.from(result.xAxis).forEach((x, i) => {
      let copy: string = x as string;
      const formattedDateString = copy.replace(' ', 'T');
      const time = new Date(formattedDateString);
      dpsSolarPanel.push({x: time, y: Number.parseFloat(result.productPower[i])})
      dpsSelfUsePower.push({x: time, y: Number.parseFloat(result.selfUsePower[i])})
      dpsUsePower.push({x: time, y: Number.parseFloat(result.usePower[i])})
    })

    this.chartOptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: "Consum"
      },
      axisX: {
        valueFormatString: "HH:mm"
      },
      axisY: {
        title: "Graphic"
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: function (e: any) {
          e.dataSeries.visible = !(typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible);
          e.chart.render();
        }
      },
      data: [{
        type: "line",
        showInLegend: true,
        name: " Produs Panou solar",
        xValueFormatString: "HH:mm",
        dataPoints: dpsSolarPanel
      },
        {
          type: "line",
          showInLegend: true,
          name: "Consum din panouri",
          dataPoints: dpsSelfUsePower
        },

        {
          type: "line",
          showInLegend: true,
          name: "Consum total",
          dataPoints: dpsUsePower
        }
      ]
    }
  }

}

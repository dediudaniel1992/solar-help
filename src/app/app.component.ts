import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {RepositoryService} from "./repository.service";
import {isPlatformBrowser, JsonPipe} from "@angular/common";
import {CanvasJSAngularChartsModule} from '@canvasjs/angular-charts';
import {Subscription} from "rxjs";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, CanvasJSAngularChartsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  chartOptions: any = {};
  intervalId: any;
  subscription: Subscription | undefined;
  url: string | null = '';
  user: string | null = '';
  password: string | null = '';

  constructor(private repo: RepositoryService,@Inject(PLATFORM_ID) private platformId:any) {


    if(isPlatformBrowser(platformId)){
      this.url =  localStorage.getItem("url")
      this.user =  localStorage.getItem("user")
      this.password =  localStorage.getItem("password")
      this.load()
      this.intervalId = setInterval(() => {
        this.load()
      }, 300000); // 300,000 ms = 5 minutes
    }
  }

  load(): void {
    this.subscription = this.repo.getData()?.subscribe(data => {
      this.loadData(data)
    })
  }

  saveToLocalStorage(): void {
    if(isPlatformBrowser(this.platformId)){
      localStorage.setItem('url', this.url!);
      localStorage.setItem('user', this.user!);
      localStorage.setItem('password', this.password!);
    }


  }

  loadData(data: any) {
    let dpsSolarPanel: any = [];
    let dpsSelfUsePower: any = [];
    let dpsUsePower: any = [];
    let result = data.data;


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
        text: "Actual vs Projected Power"
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

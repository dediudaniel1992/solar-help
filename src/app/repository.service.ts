import {Injectable} from '@angular/core';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root',
  deps: [HttpClientModule]

})
export class RepositoryService {

  constructor(private http: HttpClient) { }

  public getData():Observable<any> | undefined | null{

    return this.http.get("/solar/data",
      {params:
          {url:encodeURIComponent(localStorage.getItem("url")!),
            user:encodeURIComponent(localStorage.getItem("user")!),
            password:encodeURIComponent(localStorage.getItem("password")!)
      }})
  }
}

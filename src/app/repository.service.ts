import {Injectable} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root',
  deps: [HttpClientModule]

})
export class RepositoryService {

  constructor(private http: HttpClient) {
  }

  public getData(): Observable<any> | undefined | null {

    return this.http.get("/solar/data",
      {
        params:
          {
            url: encodeURIComponent(localStorage.getItem("url")!),
            user: encodeURIComponent(localStorage.getItem("user")!),
            password: btoa(encodeURIComponent(localStorage.getItem("password")!))
          }
      })
  }

  public trigger(url: string, command: string): Observable<any> | undefined | null {
    let body = {
      url: encodeURIComponent(url),
      command: command
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post("/solar/trigger", body, {headers})

  }

}

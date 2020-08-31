import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import {keywords} from '../keywords';
import {partial_ratio} from 'fuzzball/fuzzball';
import {parse} from 'node-html-parser';

import {Domain} from '../domain';
import { windowsStore } from 'process';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isLoading : boolean = false;
  domains : Domain[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {}
  

  onLoadDomains(){
    this.isLoading=true;
    console.log('start');
    var request = new XMLHttpRequest();
    request.open('GET', 'https://cors-anywhere.herokuapp.com/http://www.domain.hu/domain/varolista/ido.html', true);
    request.overrideMimeType('text/html; charset=iso-8859-2');
    request.onreadystatechange = (function ( request: XMLHttpRequest, event: Event ): any {
      if (request.readyState === XMLHttpRequest.DONE) {
        console.log('asd');
        if (request.status === 200) {
          // const root = parse(request.response)
          var element = document.createElement('html');
          element.innerHTML=request.response;
          var elements = element.getElementsByTagName('table')[0].getElementsByTagName('tr');
          
          for (let i = 1; i < elements.length; i++) {
              const element = elements[i];
              const tds = element.getElementsByTagName('td');
              var first = tds[4].innerHTML.indexOf('"');
              var last = tds[4].innerHTML.lastIndexOf('"');
              keywords.forEach(keyword =>{
                let needs = 100;
                if (keyword.length > 3)
                {
                    needs = (keyword.length - 1) * 100 / keyword.length;
                }
                if(partial_ratio(keyword, tds[1].innerText)>needs){
                  let domain = new Domain(tds[1].innerText, tds[2].innerText, new Date(Date.parse(tds[3].innerText)), tds[4].innerHTML.substring(first+1, last), keyword);
                  this.domains.push(domain);
                  console.log('wow');
                }
            });
              
          }
        }
        this.isLoading=false;
      }
    }).bind(this, request);

    // request.onreadystatechange = function() {
    //   if (this.status >= 200 && this.status < 400) {
    //       // console.log(this.response);
    //       var element = document.createElement('html');
    //       element.innerHTML=this.response;
    //       var elements = element.getElementsByTagName('table')[0].getElementsByTagName('tr');
          
    //       for (let i = 1; i < elements.length; i++) {
    //           const element = elements[i];
    //           const tds = element.getElementsByTagName('td');
    //           var first = tds[4].innerHTML.indexOf('"');
    //           var last = tds[4].innerHTML.lastIndexOf('"');
    //           keywords.forEach(keyword =>{
    //             let needs = 100;
    //             if (keyword.length > 3)
    //             {
    //                 needs = (keyword.length - 1) * 100 / keyword.length;
    //             }
    //             if(partial_ratio(keyword, tds[1].innerText)>needs){
    //               let domain = new Domain(tds[1].innerText, tds[2].innerText, new Date(Date.parse(tds[3].innerText)), tds[4].innerHTML.substring(first+1, last));
    //               // domains.push(domain);
    //               console.log('wow')
    //             }
    //         });
              
    //       }
          
    //   } else {
    //   }
    // };
    request.send();

  }

  openDetails(url:string){
    window.open("http://www.domain.hu/domain/varolista/"+url);
  }

}

import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import {keywords} from '../keywords';
import {partial_ratio} from 'fuzzball/fuzzball';
import {writeFile} from 'fs';

import {Domain} from '../domain';
import { windowsStore, electron } from 'process';
import { shell } from 'electron';
import { join } from 'path';
import { domainToASCII } from 'url';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isLoading : boolean = false;
  isNewDomain : boolean = false;
  domains : Domain[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {}
  
  onDeleteDomain(domain : Domain){
    const fs = window.fs;
    const index = this.domains.indexOf(domain);
    if (index > -1) {
      this.domains.splice(index, 1);
    }
    fs.writeFile('./src/assets/history.txt', this.domains.join('\n'), { flag: 'w' }, function(err) {
      if (err) 
        return console.error(err);
      console.log('Saved!');
    });
  }

  onLoadDomains(){
    this.isLoading=true;
    this.isNewDomain=false;
    const fs = window.fs;
    console.log('start');
    var request = new XMLHttpRequest();
    request.open('GET', 'https://cors-anywhere.herokuapp.com/http://www.domain.hu/domain/varolista/ido.html', true);
    request.overrideMimeType('text/html; charset=iso-8859-2');
    request.onreadystatechange = (function ( request: XMLHttpRequest, event: Event ): any {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var element = document.createElement('html');
          element.innerHTML=request.response;
          var elements = element.getElementsByTagName('table')[0].getElementsByTagName('tr');
          
          var alreadyFoundDomains : Domain[] = [];
          var alreadyFound : String = fs.readFileSync('./src/assets/alreadyFound.txt', 'utf-8');
          alreadyFound.split('\n').forEach((line)=>{
            var splittedLine = line.split(';');
            var domain : Domain = new Domain(splittedLine[0], splittedLine[1], new Date(Date.parse(splittedLine[2])), splittedLine[3], splittedLine[4]);
            alreadyFoundDomains.push(domain);
          });
          console.log(alreadyFoundDomains.join('\n'));
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
                if(partial_ratio(keyword, tds[1].innerText)>needs && !alreadyFoundDomains.some((value) => (value.name==tds[1].innerText && value.date.toDateString()==(new Date(Date.parse(tds[3].innerText)).toDateString())))){
                  let domain = new Domain(tds[1].innerText, tds[2].innerText, new Date(Date.parse(tds[3].innerText)), tds[4].innerHTML.substring(first+1, last), keyword);
                  this.domains.push(domain);
                }
            });
              
          }
          if(this.domains.length>0){
            fs.appendFile('./src/assets/alreadyFound.txt', this.domains.join('\n'), function(err) {
              if (err) 
                return console.error(err);
              console.log('Saved!');
            });
            fs.appendFile('./src/assets/history.txt', this.domains.join('\n'), function(err) {
              if (err) 
                return console.error(err);
              console.log('Saved!');
            });
          }else{
            this.isNewDomain=true;
          }
          
        }
        this.isLoading=false;
      }
    }).bind(this, request);
    request.send();

  }

  onDetails(url:string){
    window.open("http://www.domain.hu/domain/varolista/"+url);
  }

}

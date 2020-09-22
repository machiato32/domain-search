import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { windowsStore, electron } from 'process';
import { shell } from 'electron';

import {Domain} from '../domain';

@Component({
  selector: 'history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  domains : Domain[] = [];
  isDomains : boolean = false;

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


  ngOnInit(): void {
    this.isDomains=false;
    console.log(window.fs);
    const fs = window.fs;
    console.log(fs);
    this.domains=[];
    var alreadyFound : String = fs.readFileSync('./src/assets/history.txt', 'utf-8');
    alreadyFound.split('\n').forEach((line)=>{
      var splittedLine = line.split(';');
      if(splittedLine[1]!=undefined){
        var domain : Domain = new Domain(splittedLine[0], splittedLine[1], new Date(Date.parse(splittedLine[2])), splittedLine[3], splittedLine[4]);
        this.domains.push(domain);
      }
    });
    if(this.domains.length==0){
      this.isDomains=true;
    }
  }

  onDetails(url:string){
    window.open("http://www.domain.hu/domain/varolista/"+url);
  }

}

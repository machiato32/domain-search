export class Domain{
    name : string;
    sender : string;
    date : Date;
    url : string;
    matchingKey : string;
    constructor(name:string, sender:string, date:Date, url:string, matchingKey:string=""){
        this.name=name;
        this.sender=sender;
        this.date=date;
        this.url=url;
        this.matchingKey=matchingKey;
    }
}
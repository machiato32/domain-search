export class Domain{
    name : string;
    sender : string;
    date : Date;
    deadlineDate: Date;
    url : string;
    matchingKey : string;
    constructor(name:string, sender:string, date:Date, url:string, matchingKey:string){
        this.name=name;
        this.sender=sender;
        this.date=date;
        this.url=url;
        this.matchingKey=matchingKey;
        this.deadlineDate= new Date(this.date.getTime()+(1000 * 60 * 60 * 24)*7);
    }
    toString() : string {
        return this.name+';'+this.sender+';'+this.date.toString()+';'+this.url+';'+this.matchingKey;
    }
}
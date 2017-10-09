export class Attendee{
    private _id: string;
    private _name:string;
    private _company: string;
    private _detail:string;
    private _email:string;
    private _image:string;
    private _checkedin: boolean;
    private _updateInProgress: boolean;
    private _numberOfTickets: number;
    private _jobTitle: string;

    public get Id(): string { return this._id; }
    public get Name(): string { return this._name; }
    public get Company(): string { return this._company; }
    public get DetailUrl(): string { return this._detail; }
    public get Email(): string { return this._email; }
    public get ImageUrl(): string { return this._image; }
    public get FirstName(): string { return this._name.split(' ').shift(); }
    public get LastName(): string { return this._name.split(' ').pop(); }  
    public get JobTitle(): string{ return this._jobTitle;}  
 
    public get CheckedIn(): boolean { return this._checkedin; }
    public set CheckedIn(val: boolean) { this._checkedin = val; }
    public get UpdateInProgress(): boolean { return this._updateInProgress; }
    public set UpdateInProgress(val: boolean) { this._updateInProgress = val; }
    public get NumberOfTickets() : number { return this._numberOfTickets; }
    public set NumberOfTickets(val: number) { this._numberOfTickets = val; }

    constructor(id: string, name:string, company: string,profileUrl:string, email:string, image?:string, checkedin?: boolean, numberOfTickets?: number ){
        this._id = id;
        this._name = name;
        this._company = company;
        this._detail = profileUrl;
        this._email = email;
        this._image = image ? image : '';
        this._checkedin = checkedin || false;
        this._numberOfTickets = numberOfTickets || 0;
        this._updateInProgress = false;
    }
}

export class AttendeeCollection{
    attendees: Array<Attendee>
    nextPage: number; 
}
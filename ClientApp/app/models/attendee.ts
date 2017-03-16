export class Attendee{
    private _id: string;
    private _name:string;
    private _company: string;
    private _detail:string;
    private _email:string;
    private _image:string;
    private _checkedin: boolean;

    public get Id(): string { return this._id; }
    public get Name(): string { return this._name; }
    public get Company(): string { return this._company; }
    public get DetailUrl(): string { return this._detail; }
    public get Email(): string { return this._email; }
    public get ImageUrl(): string { return this._image; }

    public get CheckedIn(): boolean { return this._checkedin; }
    public set CheckedIn(val: boolean) { this._checkedin = val; }

    constructor(id: string, name:string, company: string, profileUrl:string, email:string, image?:string, checkedin?: boolean ){
        this._id = id;
        this._name = name;
        this._company = company;
        this._detail = profileUrl;
        this._email = email;
        this._image = image ? image : '';
        this._checkedin = checkedin || false;
    }

}
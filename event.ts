export class Event{
    private _id: string;
    private _name:string;
    private _nameHtml: string;
    private _description:string;
    private _descriptionHtml:string;
    private _detail:string;
    private _start:Date;
    private _end:Date;
    private _location:string;
    private _image:string;

    public get Id(): string { return this._id; }
    public get Name(): string { return this._name; }
    public get NameAsHtml(): string { return this._nameHtml; }
    public get Description(): string { return this._description; }
    public get DescriptionAsHtml(): string { return this._descriptionHtml; }
    public get DetailUrl(): string { return this._detail; }
    public get Start(): Date { return this._start; }
    public get End(): Date { return this._end; }
    public get Location(): string { return this._location; }
    public get ImageUrl(): string { return this._image; }
    public get Footer2(): string{ return this._nameHtml.split(":").pop(); }
    public get Footer1(): string{ return this._location;}

    constructor(id: string, name:string, description: string, url:string, start:Date, end?:Date, location?:string, image?:string, nameHtml?:string, descriptionHtml?:string ){
        this._id = id;
        this._name = name;
        this._description = description;
        this._nameHtml = nameHtml ? nameHtml : name;
        this._descriptionHtml = descriptionHtml ? descriptionHtml : description;
        this._detail = url;
        this._start = start;
        this._end = end ? end : null;
        this._location = location ? location : '';
        this._image = image ? image : '';
    }

}
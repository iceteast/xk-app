import {customElement, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import {map} from "lit/directives/map.js";
import {classMap} from "lit/directives/class-map.js"
import symbol from "/symbol.svg"
import {
    clear, load, submit, formatCourse,
    courseNameRex, emailRex, semesterRex, userNameRex,
    CHECKITEM, Item, getAll,
} from "../Scripts/utils.ts";

@customElement('my-course')
export class CourseList extends LitElement {
    @state() js: Array<Item> = [];                          // json object from database
    @state() checklist : Set<CHECKITEM> = new Set([         // check if all properties are valid
        CHECKITEM.SEMESTER,
        CHECKITEM.CONTACT,
        CHECKITEM.COURSENAME,
        CHECKITEM.USERNAME
    ]);

    @state() toggleHelp : boolean = true;                   // switch for help table
    @state() page : number = 1;                             // current page of database
    @state() limit : number = 10;                           // item limit per page

    /**
     * check if all properties are valid.
     */
    @state() isValid = () => this.checklist.size == 0;

    private data : Item = {                                 // temporary json for submit
        contact:"",
        semester:"",
        courseName:"",
        userName:"",
        createdAt:0,
    };
    private toggleSet : Set<Item> = new Set();              // save the item which can be shown.
    private count : number = 0;                             // storage the number of items

    /**
     * select element with pre-processing options.
     */
    private semesterMenu = () => {
        let date = new Date();
        let opt1: string;
        let opt2: string;

        let year = new Date().getFullYear() % 100;

        if (date.getMonth() < 4) {
            opt1 = (year - 1).toString() + 'WS';
            opt2 = year.toString() + 'SS';
        } else if (date.getMonth() >= 4 && date.getMonth() < 10) {
            opt1 = year.toString() + 'SS';
            opt2 = year.toString() + 'WS';
        } else {
            opt1 = year.toString() + 'WS';
            opt2 = (year + 1).toString() + 'SS';
        }

        return html`
            <select
                class="${classMap({
                    warn: this.checklist.has(CHECKITEM.SEMESTER),
                    select: true
                })}"
                name="semester" @change="${this.handleInput}"
            >
                <option value="10" selected>...</option>
                <option value="${opt1}">${opt1}</option>
                <option value="${opt2}">${opt2}</option>
            </select>
        `
    }

    /**
     * clear the temporary data and the UI inputs.
     */
    private clear = () => {
        if (this.shadowRoot != null) {
            const inputs = this.shadowRoot.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = '';
            });

            const selects = this.shadowRoot.querySelectorAll('select');
            selects.forEach(select => {
                select.value = '10';
            })
        }
        clear(this.data)
    }
    /**
     * submit the data in form to database.
     */
    private submit = async () => {
        this.data.createdAt = Date.now();
        console.log(this.data)
        if (this.isValid()) {
            submit(this.data)
            this.clear()
            await this.loadData();
            await this.getCount();
        }
    }
    /**
     * click event function for help table.
     */
    private toggle() {
        this.toggleHelp = !this.toggleHelp;
        this.requestUpdate();
    }

    /**
     * help table element.
     */
    private help() {
        return html`
            <table ?hidden="${this.toggleHelp}" class="fancy-table">
                <tr>
                    <td><b>Course Name:</b></td>
                    <td>e.g. NNTI, MMIA</td>
                </tr>
                <tr>
                    <td><b>Semester:</b></td>
                    <td>only current semester and next semester</td>
                </tr>
                <tr>
                    <td><b>Name:</b></td>
                    <td>4-12 letters or numbers no space</td>
                </tr>
                <tr>
                    <td><b>Contact:</b></td>
                    <td>email, teams, whatApp, usw... just add it after (at). e.g. 1703049910@whatApp.</td>
                </tr>
            </table>
        `
    }

    /**
     * register the item to the {@link this.toggleSet}.
     */
    private regContact(item: Item) {
        this.toggleSet.add(item)
        this.requestUpdate()
    }
    /**
     * if a contact need to be displayed.
     */
    private isHidden = (item: Item) => !this.toggleSet.has(item);

    /**
     * contact element, with a collapse feature.
     */
    private formatContact(item: Item) {
        return html`
            <span @click="${() => this.regContact(item)}"> ${this.isHidden(item) ? "<click to get the contact>" : item.contact}</span>
        `
    }
    /**
     * database header.
     */
    private cData() {
        return html`
            ${map(
                    this.js, (item) => {
                        return html`
                            <tr>
                                <td>${formatCourse(item)}</td>
                                <td>${item.userName}</td>
                                <td>${this.formatContact(item)}</td>
                            </tr>
                        `
                    }
            )}
        `
    }

    private nextPage = async () => {
        this.page = Math.min(this.page + 1, Math.ceil(this.count / this.limit));
        await this.loadData();
    }

    private prevPage = async () => {
        this.page = Math.max(this.page - 1, 1);
        await this.loadData();
    }
    /**
     * database context.
     */
    private cList() {
        return html`
            <table class="fancy-table">
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th style="width:20%">User Name</th>
                        <th style="width:30%">Contact</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            ${this.semesterMenu()}
                            <input 
                                class="${classMap({
                                    warn: this.checklist.has(CHECKITEM.COURSENAME),
                                    name: true
                                })}" 
                                type="text" name="course"
                                @input="${this.handleInput}"
                                placeholder="Prog II"
                            >
                        </td>
                        <td>
                            <input
                                class="${classMap({
                                    warn: this.checklist.has(CHECKITEM.USERNAME),
                                    name: true
                                })}"
                                type="text" name="username"
                                @input="${this.handleInput}"
                                placeholder="Jane Doe"
                            >
                        </td>
                        <td>
                            <input
                                class="${classMap({
                                    warn: this.checklist.has(CHECKITEM.CONTACT),
                                    name: true
                                })}"
                                type="email" name="contact"
                                @input="${this.handleInput}"
                                placeholder="s9hornet@teams"
                            >
                            <button class="name" ?disabled="${!this.isValid()}" @click=${this.submit}>Submit</button>
                        </td>
                    </tr>
                    ${this.cData()}
                </tbody>
            </table>
            <div class="navigator">
                <select name="limit" @change="${this.handleInput}">
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
                <button 
                        ?disabled="${this.page === 1}" 
                        @click="${this.prevPage}"
                >
                    Prev
                </button>
                <button 
                        ?disabled="${this.page >= Math.ceil(this.count / this.limit)}" 
                        @click="${this.nextPage}"
                >
                    Next
                </button>
            </div>
        `
    }
    //TODO we do table not right.

    /**
     * handle input and select message.
     */
    async handleInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const name = input.name;
        const value = input.value;
        switch (name) {
            case "limit": {
                this.limit = Number(input.value);
                this.page = 1; //Set page to 1.
                await this.loadData();
                break;
            }
            case "semester": {
                this.checklist = new Set(this.checklist);
                if (semesterRex.test(value)) {
                    this.checklist.delete(CHECKITEM.SEMESTER)
                    this.data.semester = value;
                } else {
                    this.checklist.add(CHECKITEM.SEMESTER);
                }
                break;
            }
            case "course": {
                this.checklist = new Set(this.checklist);
                if (courseNameRex.test(value)) {
                    this.checklist.delete(CHECKITEM.COURSENAME);
                    this.data.courseName = value;
                } else {
                    this.checklist.add(CHECKITEM.COURSENAME);
                }
                break;
            }
            case "username": {
                this.checklist = new Set(this.checklist);
                if (userNameRex.test(value)) {
                    this.checklist.delete(CHECKITEM.USERNAME);
                    this.data.userName = value;
                } else {
                    this.checklist.add(CHECKITEM.USERNAME);
                }
                break;
            }
            case "contact": {
                this.checklist = new Set(this.checklist);
                if (emailRex.test(value)) {
                    this.checklist.delete(CHECKITEM.CONTACT);
                    this.data.contact = value;
                } else {
                    this.checklist.add(CHECKITEM.CONTACT);
                }
                break;
            }
            default: break;
        }
    }
    /**
     * calculate the total number of data.
     */
    private async getCount() {
        try {
            const data = await getAll();
            this.count = data.length;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    /**
     * (re)load the data from database.
     */
    private async loadData() {
        try {
            this.js = await load(this.page, this.limit);
            this.toggleSet.clear();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.getCount();
        await this.loadData();
    }

    render() {

        return html`
            <h1 class="title">Pinnwand fürs Group Suchen<img @click="${this.toggle}" src="${symbol}" alt="Icon"></h1>
            <div>${this.help()}</div>
            <div>${this.cList()}</div>
        `;
    }

    static styles = css`
        /* global setting */

        :host {
            width: 100%;
            max-width: 1000px;
            display: block;
            margin: 0 auto;
            text-align: center;
        }

        /* title */

        .title {
            font-size: 3rem;
            width: 100%;
            text-align: center;
            background: linear-gradient(1deg, #acff00, #0085ff, #9000cc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* toggle button */

        .toggle {
            aspect-ratio: 25;
            width: 100%;
            color: #dddddd;
            background-color: #242424;
            font-size: 0.7vw;
            max-font-size: 4px;
            border: 1px solid #353535;
            justify-content: center;
            cursor: pointer;
            transition: border-color 0.25s;
        }

        .toggle:hover {
            background-color: #135151;
            opacity: 0.94;
        }

        /* highlight invalid element*/
        
        .name {
            max-width: 11rem;
            flex: 0 1 auto;
            -webkit-text-fill-color: initial;
        }

        .select {
            width: 13%;
            max-width: 4rem;
            flex: 0 1 auto;
            -webkit-text-fill-color: initial;
        }

        .warn {
            border-color: #9e0000;
            border-width: 2px;
        }

        .navigator {
            text-align: right;
        }


        /* a fancy table */

        .fancy-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            text-align: left;
            background: linear-gradient(0deg, #ac85ff, #0085ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .fancy-table th, .fancy-table td {
            border: 0 solid #dddddd;
        }
        
        .fancy-table th {
            color: white;
        }
        
        .fancy-table tbody tr:hover {
            text-shadow: 0 0 8px #ff8800, 0 0 12px #ff8800, 0 0 16px #ff8800;
            transition: color 0.2s, text-shadow 0.2s;
        }
    `;
}
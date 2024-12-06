import {customElement, state} from "lit/decorators.js";
import {css, html, LitElement, TemplateResult} from "lit";
import submit_svg from "/add.svg"
import {
    load, getAll, formatCourse,
    Item,
} from "../Scripts/utils.ts";
import {map} from "lit/directives/map.js";

@customElement('my-course')
export class CourseList extends LitElement {
    @state() js: Array<Item> = [];                          // json object from database
    @state() page : number = 1;                             // current page of database
    @state() limit : number = 10;                           // item limit per page
    @state() view : string = "list"                         // default view is list
    @state() count : number = 0;                             // storage the number of items

    public toggleSet : Set<Item> = new Set();              // save the item which can be shown.


    /**
     * display data in list view.
     */
    listDisplay(): TemplateResult<1> {
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
                </tbody>
            </table>
        `
    }

    /**
     * display data in grid view.
     */
    gridDisplay() {
        return html`
            <div class="grid">
                ${map(
            this.js, (item) => {
                return html`
                            <div class="block">
                                <div class="blockT">${formatCourse(item)}</div>
                                <div class="blockU">${item.userName}</div>
                                <div class="blockC">${this.formatContact(item)}</div>
                            </div>
                        `
            }
        )}
            </div>
        `
    }

    /**
     * contact element, with a collapse feature.
     */
    public formatContact(
        item: Item
    ) {
        return html`
            <span 
                @click="${() => this.regContact(item)}"
            > 
                ${this.isHidden(item) ? "<click to get the contact>" : item.contact}
            </span>
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
    private dataView() {
        return html`
            ${this.view === "list" ? this.listDisplay() : this.gridDisplay()}
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

    /**
     * handle input and select message.
     */
    async handleInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const name = input.name;
        const value = input.value;
        switch (name) {
            case "limit": {
                this.limit = Number(value);
                this.page = 1; //Set page to 1.
                await this.loadData();
                break;
            }
            case "view": {
                this.view = value;
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
        await this.loadData();
        await this.getCount();
    }

    render() {

        return html`
            <h1 class="title">
                Pinnwand fürs Group Suchen
                <a href="/submit">
                    <img src="${submit_svg}" alt="Icon" width="30px" height="30px">
                </a>
            </h1>
            <div class="navigator">
                <label>
                    <input
                            type="radio"
                            name="view"
                            value="list"
                            @change="${this.handleInput}"
                            ?checked="${this.view === 'list'}"
                    />
                    List
                </label>
                <label>
                    <input
                            type="radio"
                            name="view"
                            value="grid"
                            @change="${this.handleInput}"
                            ?checked="${this.view === 'grid'}"
                    />
                    Grid
                </label>
            </div>
            <div>${this.dataView()}</div>
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

        /* align right */
        
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
        
        /* block */
        .grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center; 
            gap: 1vw;
            margin: 5px auto;
            max-width: 700px;
        }
        .block {
            aspect-ratio: 3;
            width: 40%;
            height: auto;
            color: #dddddd;
            background: linear-gradient(0deg, #ac85ff, #0085ff);
            border-radius: 0.5vw;
            justify-content: center;
            cursor: pointer;
            transition: background 0.25s;
        }

        .block:hover {
            background: linear-gradient(0deg, #0085ff, #ac85ff);
        }

        .block:focus,
        .block:focus-visible {
            outline: 2px auto -webkit-focus-ring-color;
        }

        .blockT {
            font-size: clamp(6px, 1.7vw, 20px); 
            padding-bottom: 1vw;
            line-height: 1.2;
        }
        .blockU {
            font-size: clamp(6px, 1.7vw, 17px);
            padding-bottom: 1vw;
        }
    `;
}
import {customElement, state} from "lit/decorators.js";
import {html, css, LitElement} from "lit";
import {CHECKITEM, APP_URL, courseNameRex, emailRex, Item, semesterRex, userNameRex, valid, clear} from "../Scripts/utils.ts";
import {classMap} from "lit/directives/class-map.js";
import symbol from "/symbol.svg"

@customElement('my-submit')
export class Submit extends LitElement {
    @state() toggleHelp : boolean = true;                   // switch for help table
    @state() checklist : Set<CHECKITEM> = new Set([         // check if all properties are valid
        CHECKITEM.SEMESTER,
        CHECKITEM.CONTACT,
        CHECKITEM.COURSENAME,
        CHECKITEM.USERNAME
    ]);
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
                <option value="0" selected>...</option>
                <option value="${opt1}">${opt1}</option>
                <option value="${opt2}">${opt2}</option>
            </select>
        `
    }

    /**
     * submit the data in form to database.
     */
    private submit = async () => {
        this.data.createdAt = Date.now();
        if (this.isValid()) {
            if (!valid(this.data)) {
                console.error("invalid item")
                return false;
            }

            const res = await fetch(APP_URL, {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(this.data)
            });
            if (res.ok)
                window.location.href = '/';
            else
                console.error("submit error:", res.statusText)
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

    private clear = () => {
        if (this.shadowRoot != null) {
            const inputs = this.shadowRoot.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = '';
            });

            const selects = this.shadowRoot.querySelectorAll('select');
            selects.forEach(select => {
                select.value = '0';
            })
        }
        clear(this.data)
    }
    private return = () => window.location.href = "/";
    private input = () => {
        return html`
            <table class="fancy-table">
                <tr>
                    <td>Course:</td>
                    <td>
                        ${this.semesterMenu()}
                        <input
                                class="${classMap({
                                    warn: this.checklist.has(CHECKITEM.COURSENAME),
                                    shortText: true
                                })}"
                                type="text" name="course"
                                @input="${this.handleInput}"
                                placeholder="Prog II"
                        >
                    </td>
                </tr>
                <tr>
                    <td>Name:</td>
                    <td>
                        <input
                                class="${classMap({
                                    warn: this.checklist.has(CHECKITEM.USERNAME),
                                    longText: true
                                })}"
                                type="text" name="username"
                                @input="${this.handleInput}"
                                placeholder="Jane Doe"
                        >
                    </td>
                </tr>
                <tr>
                    <td>Contact:</td>
                    <td>
                        <input
                                class="${classMap({
                                    warn: this.checklist.has(CHECKITEM.CONTACT),
                                    longText: true
                                })}"
                                type="email" name="contact"
                                @input="${this.handleInput}"
                                placeholder="s9hornet@teams"
                        >
                    </td>
                </tr>
                <tr>
                    <td/>
                    <td>
                        <button class="button" ?disabled="${!this.isValid()}" @click=${this.submit}>Submit</button>
                        <button class="button" @click=${this.clear}>Reset</button>
                        <button class="button" @click=${this.return}>Return</button>
                    </td>
                </tr>
            </table>
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

    render() {
        return html`
            <h1 class="title">Pinnwand fürs Group Suchen<img @click="${this.toggle}" src="${symbol}" alt="Icon"></h1>
            <div>${this.help()}</div>
            <div>${this.input()}</div>
        `
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

        /* highlight invalid element*/
        
        .shortText {
            width: 43%;
            max-width: 19rem;
            min-width: 12rem;
            flex: 0 1 auto;
            -webkit-text-fill-color: initial;
        }
        
        .longText {
            width: 80%;
            max-width: 19rem;
            min-width: 11rem;
            flex: 0 1 auto;
            -webkit-text-fill-color: initial;
        }
        .button {
            aspect-ratio: 3;
            width: 23%;
            max-width: 65px;
            min-width: 15px;
            height: auto;
            background: linear-gradient(0deg, rgba(12, 234, 15, 0.2), rgba(12, 34, 215, 0.2));
            border-radius: 1vw;
            justify-content: center;
            cursor: pointer;
            -webkit-text-fill-color: initial;
        }
        button:disabled:hover {
            box-shadow: initial;
        }
        
        .button:hover {
            box-shadow: 0 0 8px #ff8800, 0 0 12px #ff8800, 0 0 16px #ff8800;
            transition: color 0.2s, text-shadow 0.2s;
        }
        
        .select {
            width: 20%;
            max-width: 65px;
            min-width: 15px;
            flex: 0 1 auto;
            -webkit-text-fill-color: initial;
        }

        .warn {
            border-color: #9e0000;
            border-width: 2px;
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
    `
}
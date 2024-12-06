import {customElement, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import {map} from "lit/directives/map.js";
import {classMap} from "lit/directives/class-map.js"
import expend from "/expend.svg"
import fold from "/unexpend.svg"

import {
    clear, load, submit,
    courseNameRex, emailRex, semesterRex, userNameRex,
    CHECKITEM, Item, formatCourse,
} from "../Scripts/utils.ts";

@customElement('my-course')
export class CourseList extends LitElement {
    @state() js: Array<Item> = [];
    @state() checklist : Set<CHECKITEM> = new Set([
        CHECKITEM.SEMESTER,
        CHECKITEM.CONTACT,
        CHECKITEM.COURSENAME,
        CHECKITEM.USERNAME
    ]);
    @state() toggleHelp : boolean = true;
    @state() isValid = () => this.checklist.size == 0;

    private data : Item = {contact:"", semester:"", courseName:"", userName:""};

    private semesterMenu = () => {
        let date = new Date();
        let opt1: string
        let opt2: string

        let year = new Date().getFullYear() % 100

        if (date.getMonth() < 4) {
            opt1 = (year - 1).toString() + 'WS'
            opt2 = year.toString() + 'SS'
        } else if (date.getMonth() >= 4 && date.getMonth() < 10) {
            opt1 = year.toString() + 'SS'
            opt2 = year.toString() + 'WS'
        } else {
            opt1 = year.toString() + 'WS'
            opt2 = (year + 1).toString() + 'SS'
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

    private clear = () => {
        if (this.shadowRoot != null) {
            const inputs = this.shadowRoot.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = '';
            });
        }
        clear(this.data)
    }

    private submit = async () => {
        console.log(this.data)
        if (this.isValid()) {
            submit(this.data)
            this.clear()
            await this.loadData();
        }
    }

    private toggle() {
        this.toggleHelp = !this.toggleHelp;
        this.requestUpdate();
    }

    private help() {
        return html`
            <table class="fancy-table">
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
                    <td>email, teams, whatApp, usw... just add it after @. like 1703049910@whatApp.</td>
                </tr>
            </table>
        `
    }

    private main() {
        return html`
            <div ?hidden="${this.toggleHelp}">${this.help()}</div>
            <button class="toggle" @click="${this.toggle}"><img src="${this.toggleHelp ? expend : fold}" alt="Icon">
                </button>
            <div class="submitform">
                Course Name:
                    <input 
                        class="${classMap({
                            warn: this.checklist.has(CHECKITEM.COURSENAME),
                            name: true
                        })}"
                        type="text" name="course" 
                        @input="${this.handleInput}" 
                        placeholder="Prog II"
                    >
                Semester:${this.semesterMenu()}<p></p>
                Nick Name:
                    <input 
                        class="${classMap({
                            warn: this.checklist.has(CHECKITEM.USERNAME),
                            name: true
                        })}"
                        type="text" name="username"
                        @input="${this.handleInput}"
                        placeholder="Jane Doe"
                    >
                Contact:
                    <input
                        class="${classMap({
                            warn: this.checklist.has(CHECKITEM.CONTACT),
                            name: true
                        })}"
                        type="email" name="contact" 
                        @input="${this.handleInput}" 
                        placeholder="s9hornet@teams">
                <button ?disabled="${!this.isValid()}" @click=${this.submit}>Submit</button>
            </div>
        `
    }



    private cData() {
        return html`
            ${map(
                    this.js, (item) => {
                        return html`
                            <tr>
                                <td>${formatCourse(item)}</td>
                                <td>${item.userName}</td>
                                <td>${item.contact}</td>
                            </tr>
                        `
                    }
            )}
        `
    }

    private cList() {
        return html`
            <table class="fancy-table">
                <tr>
                    <td><b>Course Name</b></td>
                    <td><b>User Name</b></td>
                    <td><b>Contact</b></td>
                </tr>
                ${this.cData()}
            </table>
        ` // how to hide this by clicking?
    }

    handleInput(event: Event) {
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
    private async loadData() {
        try {
            this.js = await load();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadData();
    }

    render() {

        return html`
            <h1 class="title">Pinnwand fürs Group Suchen</h1>
            <div>${this.main()}</div>
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
        .submitform {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .name {
            width: 30%;
            max-width: 11rem;
            flex: 0 1 auto; 
            //padding: 5px;
        }
        .select {
            width: 10%;
            max-width: 4rem;
            flex: 0 1 auto;
            //padding: 5px;
        }
        
        .warn {
            border-color: red;
            border-width: 2px;
        }
        
        /* a fancy leaderboard */

        .fancy-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            //font-size: 18px;
            text-align: center;
            background: linear-gradient(90deg, #ff9a9e, #fad0c4, #fad0c4, #fbc2eb, #a18cd1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .fancy-table th, .fancy-table td {
            border: 1px solid #dddddd;
        }

        .fancy-table th {
            background-color: #4CAF50;
        }

        .fancy-table tbody tr:hover {
            background-color: rgba(8, 138, 91, 0.4);
        }
    `;
}
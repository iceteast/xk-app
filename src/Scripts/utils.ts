const APP_URL = 'https://' + import.meta.env.VITE_API_KEY + '.mockapi.io/api/' + import.meta.env.VITE_API_FOLDER

export enum CHECKITEM {
    COURSENAME,
    USERNAME,
    CONTACT,
    SEMESTER,
}

export interface Item {
    courseName: string;
    semester: string;
    userName: string;
    contact: string;
}

export const userNameRex: RegExp = /^[\p{L}0-9._]{4,12}$/u;
export const courseNameRex: RegExp = /^[\p{L}0-9 ._]{2,30}$/u;
export const emailRex: RegExp = /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/;
export const semesterRex: RegExp = /^[0-9][0-9][WS]S$/;

export function clear(item: Item) {
    item.courseName = "";
    item.semester = "";
    item.userName = "";
    item.contact = "";
}
export function formatCourse(item: Item) {
    return '[' + item.semester + ']' + item.courseName;
}

function valid(item: Item) {
    if (!userNameRex.test(item.userName)) return false;
    if (!courseNameRex.test(item.courseName)) return false;
    if (!emailRex.test(item.contact)) return false;
    return semesterRex.test(item.semester);

}
export async function getAll() {
    const url = new URL(APP_URL);
    url.searchParams.append('sortBy', 'createdAt');
    url.searchParams.append('order', 'desc');

    const response = await fetch(url, {
        method: 'GET',
        headers: {'content-type': 'application/json'},
    });

    return response.json();
}

export async function load(page:number=1, limit:number=10) {
    const url = new URL(APP_URL);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('sortBy', 'createdAt');
    url.searchParams.append('order', 'desc');

    const response = await fetch(url, {
        method: 'GET',
        headers: {'content-type':'application/json'},
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

export function submit(item: Item) {
    if (!valid(item)) {
        console.error("invalid item")
        return false;
    }

    fetch(APP_URL, {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(item)
    }).catch(error => console.error(error));
    return true;
}
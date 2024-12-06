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

export const userNameRex: RegExp = /^[\p{L}0-9]{4,12}$/u;
export const courseNameRex: RegExp = /^[\p{L}0-9 ]{2,30}$/u;
export const emailRex: RegExp = /^[A-Za-z0-9]+@[A-Za-z0-9.-]+$/;
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

export async function load(page:number=1) {
    const url = new URL('https://6751e8cbd1983b9597b4c902.mockapi.io/api/xk/course');
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(10));

    const response = await fetch(url, {
        method: 'GET',
        headers: {'content-type':'application/json'},
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json().then(json => json);
}

export function submit(item: Item) {
    if (!valid(item)) {
        console.error("invalid item")
        return false;
    }

    fetch('https://6751e8cbd1983b9597b4c902.mockapi.io/api/xk/course', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(item)
    }).catch(error => console.error(error));
    return true;
}
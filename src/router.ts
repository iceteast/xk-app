import { Router } from '@vaadin/router';

export function setupRouter(outlet: HTMLElement) {
    const router = new Router(outlet);

    router.setRoutes([
        { path: '/', component: 'my-course' },
        { path: '/submit', component: 'my-submit' },
    ]);
}
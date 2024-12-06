import { Router } from '@vaadin/router';

export function setupRouter(outlet: HTMLElement) {
    const router = new Router(outlet);

    router.setRoutes([
        { path: '/', component: 'my-course' }, // 默认页面
        { path: '/submit', component: 'my-submit' }, // /submit 页面
    ]);
}
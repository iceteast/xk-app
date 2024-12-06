import { setupRouter } from './router';
import './Components/courseList.ts';
import './Components/submit.ts';

const outlet = document.getElementById('app');
setupRouter(outlet!);
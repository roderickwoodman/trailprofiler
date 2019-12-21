import Vue from 'vue';
import App from './App.vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faChartLine} from '@fortawesome/free-solid-svg-icons';
import {faBan} from '@fortawesome/free-solid-svg-icons';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {faUpload} from '@fortawesome/free-solid-svg-icons';
import {faSave} from '@fortawesome/free-solid-svg-icons';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {faCamera} from '@fortawesome/free-solid-svg-icons';
import {faCameraRetro} from '@fortawesome/free-solid-svg-icons';
import {faTable} from '@fortawesome/free-solid-svg-icons';
import {faAlignLeft} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
library.add(faChartLine);
library.add(faBan);
library.add(faTrash);
library.add(faInfoCircle);
library.add(faUpload);
library.add(faSave);
library.add(faEdit);
library.add(faCamera);
library.add(faCameraRetro);
library.add(faTable);
library.add(faAlignLeft);

// eslint-disable-next-line no-undef
Vue.use(require('vue-chartist'));
Vue.use(BootstrapVue);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
	render: h => h(App),
}).$mount('#app');

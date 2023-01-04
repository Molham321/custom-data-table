import { templates } from "./templates.js";

export class DataTable extends HTMLElement {
    src = "https://jsonplaceholder.typicode.com/todos";
    cols = null;
    pageSize = 10;
    // helper values for sorting and paging
    sortAsc = false;
    curPage = 1;
    // elements
    nextButton = null
    prevButton = null;
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });

        this.src = this.hasAttribute('src') ? this.getAttribute('src') : this.src;
        this.cols = this.hasAttribute('cols') ? this.getAttribute('cols').split(',').map(i => i.trim()) : this.cols;
        this.pageSize = this.hasAttribute('pagesize') ? this.getAttribute('pagesize') : this.pageSize;

        this.sort = this.sort.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
    }

    connectedCallback() {
        this.nextButton = this.shadow.querySelector('.next');
        this.prevButton = this.shadow.querySelector('.previous');

        this.nextButton.addEventListener('click', this.nextPage, false);
        this.prevButton.addEventListener('click', this.previousPage, false);
    }

    static get observedAttributes() { return ['src']; }

    attributeChangedCallback(name, oldValue, newValue) {
        // even though we only listen to src, be sure
        if (name === 'src') {
            this.src = newValue;
        }

        this.render();
    }

    async load() {
        console.log('load', this.src);
        // error handling needs to be done :|
        let result = await fetch(this.src);
        this.data = await result.json();

        console.log('render time', this.data);
        if (!this.cols) this.cols = Object.keys(this.data[0]);

        this.renderHeader();
        this.renderBody();
    }

    renderBody() {

        let result = '';
        this.data.filter((row, index) => {
            let start = (this.curPage - 1) * this.pageSize;
            let end = this.curPage * this.pageSize;
            if (index >= start && index < end) return true;
        }).forEach(c => {
            let r = '<tr>';
            this.cols.forEach(col => {
                r += `<td>${c[col]}</td>`;
            });
            r += '</tr>';
            result += r;
        });

        let tbody = this.shadowRoot.querySelector('tbody');
        tbody.innerHTML = result;

    }

    renderHeader() {

        let header = '<tr>';
        this.cols.forEach(col => {
            header += `<th data-sort="${col}">${col}</th>`;
        });
        let thead = this.shadowRoot.querySelector('thead');
        thead.innerHTML = header;

        this.shadowRoot.querySelectorAll('thead tr th').forEach(t => {
            t.addEventListener('click', this.sort, false);
        });

    }

    async sort(e) {
        let thisSort = e.target.dataset.sort;
        console.log('sort by', thisSort);

        if (this.sortCol && this.sortCol === thisSort) this.sortAsc = !this.sortAsc;
        this.sortCol = thisSort;
        this.data.sort((a, b) => {
            if (a[this.sortCol] < b[this.sortCol]) return this.sortAsc ? 1 : -1;
            if (a[this.sortCol] > b[this.sortCol]) return this.sortAsc ? -1 : 1;
            return 0;
        });
        this.renderBody();
    }

    nextPage() {
        if ((this.curPage * this.pageSize) < this.data.length) this.curPage++;
        this.renderBody();
    }

    previousPage() {
        if (this.curPage > 1) this.curPage--;
        this.renderBody();
    }

    get style() {
        return `
        table { 
          border-collapse: collapse;
        }
        
        td, th {
          padding: 5px;
          border: 1px solid black;
        }
        
        th {
          cursor: pointer;
        }
        
        div {
          padding-top: 10px;
        }
            `;
    }

    render() {
        const template = templates.blogTable;
        this.shadowRoot.innerHTML = `<style>${this.style}</style>`
        this.shadowRoot.appendChild(template.content);

        this.load();
    }
}

// Define the new element
customElements.define('data-table', DataTable);
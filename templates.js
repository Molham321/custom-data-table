export const templates = {
    get blogTable() {
        const template = document.createElement("template");
        template.innerHTML = `
            <div>
                <table>
                    <thead></thead>
                    <tbody></tbody>
                </table>
                <div>
                    <button class="previous">Previous</button>
                    <button class="next">Next</button>
                </div>
            </div>
        `;

        return template;
    }
}
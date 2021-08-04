// Call endpoint to get profiles as json
// Parse
// Loop and create DOM elements

const getProfiles = async () => {
    try {
        const response = await axios.get('/profiles/data');
        listProfiles(response.data);
    } catch (error) {
        console.error(error);
    }
};

const init = () => {
    let profiles = getProfiles();
    console.log(profiles);
};

const listProfiles = (data) => {
    for (let user in data) {
        let record = data[user];
        var profile = document.createElement("div");
        profile.className = "profile";

        let health = record.health ? record.health : 'n/a',
            level = record.level ? record.level : 'n/a',
            experience = record.experience ? record.experience : 'n/a',
            currency = record.currency ? record.currency : 'n/a';

        let html = `
            <div className="user-stats">
                <h3 class='user-name'>${user}</h3>
                <table>
                    <tr>
                        <th>Health:</th>
                        <td>${health}</td>
                    </tr>
                    <tr>
                        <th>Level:</th>
                        <td>${level}</td>
                    </tr>
                    <tr>
                        <th>Experience:</th>
                        <td>${experience}</td>
                    </tr>
                    <tr>
                        <th>Currency:</th>
                        <td>${currency}</td>
                    </tr>
                </table>
            </div>
            <div class="user-gear">
                <h4>Gear</h4>
                <ul>
        `;
        let gearItems = ``;
        for (let slot in record.gear) {
            let item = record.gear[slot];
            if (! item) {
                continue;
            }
            gearItems += `<li><strong>${slot}</strong> ${item.name}</li>`;
        }
        html += gearItems.length === 0 
            ? `<li>Player has no gear.</li>` 
            : gearItems;
        html += `</ul>
            </div>`;
        profile.innerHTML = html;
        document.querySelector('main.container .panel .profiles').appendChild(profile);
    }
};

init();

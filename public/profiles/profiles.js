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
        console.log(record);
        var profile = document.createElement("div");
        profile.className = "profile";
        let health = record.health ? record.health : 'n/a';
        let level = record.level ? record.level : 'n/a';
        let experience = record.experience ? record.experience : 'n/a';
        let html = `
            <div className="user-stats">
                <h3 class='user-name'>${user}</h3>
                <ul>
                    <li><strong>Health:</strong> ${health}</li>
                    <li><strong>Level:</strong> ${level}</li>
                    <li><strong>Experience:</strong> ${experience}</li>
                </ul>
            </div>
            <div className="user-gear">
                <h4>Gear</h4>
                <ul>
        `;
        let gearItems = ``;
        for (let item in record.gear) {
            let details = record.gear[item];
            if (! details) {
                continue;
            }
            gearItems += `<li>${details.name}</li>`;
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

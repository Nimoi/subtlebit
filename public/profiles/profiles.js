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
        let html = `
            <h3>${user}</h3>
            <ul>
                <li><strong>Health:</strong> ${record.health}</li>
                <li><strong>Level:</strong> ${record.level}</li>
                <li><strong>Level:</strong> ${record.level}</li>
                <li><strong>Experience:</strong> ${record.experience}</li>
            </ul>
            <h4>Gear</h4>
            <ul>
        `;
        for (let item in record.gear) {
            let details = record.gear[item];
            if (! details) {
                continue;
            }
            html += `<li>${details.name}</li>`;
        }
        html += `</ul>`;
        profile.innerHTML = html;
        document.querySelector('main.container .panel').appendChild(profile);
    }
};

init();

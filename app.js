const queryString = '/status-email?accountId=8675309&accountsEndpoint=account&usersEndpoint=user&emailEndpoint=sendGrid';
const BASE_URL = 'https://safe-beyond-14033.herokuapp.com';

const parse = require('url-parse');
const axios = require('axios');

async function getEndpoint(endpoint, id) {
    const url = BASE_URL + '/' + endpoint + '/' + id;
    console.log("endpoint url: ", url);
    const {data} = await axios.get(url);
    return data;
}

async function sendEmails(emailEndpoint, users) {
    const url = BASE_URL + '/' + emailEndpoint;
    console.log("emails url: ", url);
    const {data} = await axios.post(url, {
        accountStatus: 'ACTIVE',
        users
    });
    return data;
}

async function sendAccountOwnerEmail(qs) {
    try {
        const query = parse(qs, true).query;
        console.log('query: ', query);

        // get list of accounts
        const accounts = await getEndpoint(query.accountsEndpoint, query.accountId);
        console.log("accounts: ", accounts);

        // get user details in parallel
        const promises = accounts.users.map(userId => getEndpoint(query.usersEndpoint, userId));
        const users = await Promise.all(promises);
        console.log("users: ", users);
        
        // send emails
        const usersStripped = users.map(({firstName, email}) => ({firstName, email}));
        console.log("usersStripped: ", usersStripped);
        const emails = await sendEmails(query.emailEndpoint, usersStripped);
        console.log("emails: ", emails);
    } catch (err) {
        console.log(err);
    }

}


sendAccountOwnerEmail(queryString);
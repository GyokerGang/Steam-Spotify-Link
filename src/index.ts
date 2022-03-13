import request from 'request';
import SteamUser from 'steam-user';
import SteamTOTP from 'steam-totp';

// Steam credentials
const username = 'user123';
const password = 'pwd123';
const sharedSecret = 'secret123';

// Spotify credentials
const spotifyToken = 'spotifydevtoken';

const client = new SteamUser();

const TimeUnits = {
    HOUR: 60 * 60 * 1000,
    MINUTE: 60 * 1000,
    SECOND: 1000,
    MILLISECOND: 1
};

const msToHuman = (ms: number) => {
    let hours = Math.floor(ms / TimeUnits.HOUR);
    ms -= hours * TimeUnits.HOUR;
    let minutes = Math.floor(ms / TimeUnits.MINUTE);
    ms -= minutes * TimeUnits.MINUTE;
    let seconds = Math.floor(ms / TimeUnits.SECOND);
    ms -= seconds * TimeUnits.SECOND;
    return `${hours > 0 ? hours + ':' : ''}${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
};

const updateStatus = () => {
    console.log(`Updating status at ${(new Date()).toISOString()}`);
    request({
        uri: 'https://api.spotify.com/v1/me/player/currently-playing',
        method: 'GET',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${spotifyToken}`
        },
        json: true
    }, (err, res, body) => {
        if(err) return console.error(err);
        client.setPersona(SteamUser.EPersonaState.Online);
        client.gamesPlayed(body?.is_playing ? `Listening to ${body?.item?.name ?? 'music'} [${msToHuman(body?.progress_ms)}/${msToHuman(body?.item?.duration_ms)}]` : [], false);
    });
};

client.once('steamGuard', (domain, cb) => cb(SteamTOTP.generateAuthCode(sharedSecret)));

client.once('loggedOn', () => {

    console.log(`Logged in with SteamID ${client.steamID.getSteamID64()}`);

    updateStatus();
    setInterval(updateStatus, 2000);

});

client.logOn({
    accountName: username,
    password: password
});
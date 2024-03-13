const express = require("express");
const proj4 = require('proj4');
const router = express.Router();

// const WGS84 = 'EPSG:4326'; // WGS84 - Latitude and Longitude
const WGS84 = new proj4.Proj('WGS84'); // WGS84 - Latitude and Longitude

// const UTM = (lat, lon) => `EPSG:326${Math.floor((lon + 180) / 6) + 1}`;
const UTM = (lon, lat) => `EPSG:326${Math.floor((lon + 180) / 6) + 1}`;

const zoneNumber = (lon) => Math.floor((lon + 180) / 6) + 1;

const dest = (lon, lat) => new proj4.Proj(`+proj=utm +zone=${zoneNumber(lon)} +ellps=intl +units=m +no_defs`);


function convertToUTM(obj) {

    if (Array.isArray(obj)) {
        return obj.map(item => convertToUTM(item));
    } else if (typeof obj === 'object' && obj !== null) {
        if ('lat' in obj && 'lng' in obj) {

            const point = proj4.toPoint([obj.lng, obj.lat]);
            const { x, y, z } = proj4.transform(proj4.WGS84, dest(obj.lng, obj.lat), point);
            return { ...obj, x, y, zone: UTM(obj.lng, obj.lat) };

        } else {
            const newObj = {};
            for (const key in obj) {
                newObj[key] = convertToUTM(obj[key]);
            }
            return newObj;
        }
    }
    return obj;
}

/**
 * POST 
 *
 */
router.post("/", async (req, res) => {
    try {
        const inputObject = req.body;
        const outputObject = convertToUTM(inputObject);
        res.json(outputObject);
    } catch (err) {
        console.error(err)
        res.status(400).send('Invalid input object');
    }
});

module.exports = router;
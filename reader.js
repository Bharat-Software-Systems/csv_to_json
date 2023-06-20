const fs = require('fs');
const path = require('path');

let dataStoreObject = [];

/**
 * Function to create one single object from row string and array of columns
 */
async function mapObject(row_string, column_map_arr, key_count, base_object = {}) {
    if (typeof row_string === 'string') {
        /**
         * commented code with javascript map implementation.
         */
        // row_string = row_string.replace(/\r/g, '');
        // row_string = row_string.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        // column_map_arr.map((col, idx) => {
        //     base_object[col] = row_string[idx]
        // });
        // console.log(base_object)
        // return base_object;
        row_string = row_string.replace(/\r/g, '').split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return await mapObject(row_string, column_map_arr, 0, base_object);
    }
    if (Array.isArray(row_string)) {
        if (key_count === column_map_arr.length) {
            return base_object;
        }
        base_object[column_map_arr[key_count]] = row_string[key_count];
        key_count++;
        return await mapObject(row_string, column_map_arr, key_count, base_object);
    }
}

/**
 * Function to map base object to data store object
 */
async function mapBaseObject(columns, rows, rowLength) {
    let count = 0
    if (rowLength > 0) {
        const base_object_map = await mapObject(rows[count], columns, 0);
        dataStoreObject.push(base_object_map);
        rows.splice(count, 1);
        let len = rows.length;
        return await mapBaseObject(columns, rows, len);
    }
}

async function mapArrToObject(columns, rows, row_length, INITIAL_LENGTH) {
    const START_INDEX = 0;
    let sub_row;
    let sub_row_length;
    let base_row;
    let base_row_length;
    if (row_length > INITIAL_LENGTH) {
        base_row = null;
        base_row_length = null;
        sub_row = rows.slice(START_INDEX, INITIAL_LENGTH);
        sub_row_length = sub_row.length;
        console.log(sub_row_length)
        await mapBaseObject(columns, sub_row, sub_row_length);
        base_row = rows.slice(sub_row_length, rows.length);
        base_row_length = base_row.length;
        sub_row = null;
        sub_row_length = null;
        return await mapArrToObject(columns, base_row, base_row_length, INITIAL_LENGTH);
    } else {
        await mapBaseObject(columns, rows, row_length);
    }
    return dataStoreObject;
}

async function reader(file) {
    try {
        let data = '';
        const stream = fs.createReadStream(file, 'utf8');
        for await(const chunk of stream) {
            data += chunk
        }
        let columns = data.split('\n')[0];
        columns = columns.replace(/\r/g,'').split(',');
        let rows = data.split('\n');
        rows.splice(0, 1);
        let rowLength = rows.length;
        let INITIAL_LENGTH;
        INITIAL_LENGTH = rowLength <= 100000 || rowLength <= 500000
            ? 1000 : rowLength >= 500000 && rowLength <= 1000000
            ? 5000 : 10000;
        console.log(INITIAL_LENGTH)
        const finalData = await mapArrToObject(columns, rows, rowLength, INITIAL_LENGTH);
        console.log(process.memoryUsage())
        return {
            data: finalData,
            error: null
        }
    } catch (error) {
        return {
            error,
            data: null,
        }
    }
}

module.exports = reader;
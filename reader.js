const fs = require('fs');
const path = require('path');

let dataStoreObject = [];

/**
 * Function to create one single object from row string and array of columns
 */
function mapObject(row_string, column_map_arr, key_count, base_object = {}) {
    if (typeof row_string === 'string') {
        row_string = row_string.replace(/\r/g, '').split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return mapObject(row_string, column_map_arr, 0, base_object);
    }
    if (Array.isArray(row_string)) {
        if (key_count === column_map_arr.length) return base_object;
        base_object[column_map_arr[key_count]] = row_string[key_count];
        key_count++;
        return mapObject(row_string, column_map_arr, key_count, base_object);
    }
}

/**
 * Function to map base object to data store object
 */
function mapBaseObject(columns, rows, rowLength) {
    let count = 0
    if (rowLength > 0) {
        const base_object_map = mapObject(rows[count], columns, 0);
        dataStoreObject.push(base_object_map);
        rows.splice(count, 1);
        let len = rows.length;
        return mapBaseObject(columns, rows, len);
    }
}

function mapArrToObject(columns, rows, row_length) {
    const INITIAL_LENGTH = 1000;
    const START_INDEX = 0;
    if (row_length > INITIAL_LENGTH) {
        let sub_row = rows.slice(START_INDEX, INITIAL_LENGTH);
        let sub_row_length = sub_row.length;
        mapBaseObject(columns, sub_row, sub_row_length);
        let base_row = rows.slice(sub_row_length, rows.length);
        let base_row_length = base_row.length;
        return mapArrToObject(columns, base_row, base_row_length);
    } else {
        mapBaseObject(columns, rows, row_length);
    }
    return dataStoreObject;
}

function reader() {
    try {
        const filePath = path.join(__dirname, 'sample_company_data.csv');
        const data = fs.readFileSync(filePath, 'utf8');
        let columns = data.split('\n')[0];
        columns = columns.replace(/\r/g,'').split(',');
        let rows = data.split('\n');
        rows.splice(0, 1);
        let rowLength = rows.length;
        const finalData = mapArrToObject(columns, rows, rowLength);
        return finalData;
    } catch (error) {
        console.log(error);
    }
}
console.time('reader_function');
const result = reader();
console.timeEnd('reader_function');
console.log(result);
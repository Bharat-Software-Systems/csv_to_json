# Foobar

Foobar is a Python library for dealing with word pluralization.

## Installation

Use this command to install the package.

```bash
npm i @bharat_software_systems/csv_to_json
```

## Usage

```javascript
const { reader } = require('csv_to_json'); // Requiring package

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const data = await reader(req.file.path) // Passing multer file path.
    return res.json({ data });
});
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
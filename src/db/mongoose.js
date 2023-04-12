const mongoose = require(`mongoose`)

mongoose.connect(`mongodb://127.0.0.1:5000/contacts`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected...'))
.catch((err) => console.log(err) )
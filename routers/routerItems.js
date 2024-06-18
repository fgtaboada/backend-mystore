
let express = require( 'express' )

const database = require('./../database')

let routerItems = express.Router()

routerItems.get( '/', async (req, res) => {
    database.connect();
    let items = await database.query('SELECT * FROM items')
    database.disconnect()
    res.send( items )

})

routerItems.get('/:id', async (req, res) => {
    if ( req.params.id == undefined ){
        return res.status(400).json( { error : 'no id param' } )
    }

    database.connect();
    let items = await database.query('SELECT * FROM items WHERE id = ?', [req.params.id] )
    database.disconnect()
    res.json(items)
})


module.exports = routerItems
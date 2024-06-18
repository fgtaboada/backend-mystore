
let express = require( 'express' )

const database = require('./../database')

let routerItems = express.Router()

routerItems.get( '/', async (req, res) => {
    database.connect();
    let items = []
    if ( req.query.p != undefined && !isNaN(req.query.p) ){
        let page = parseInt( req.query.p )
        let elementsperpage = 2
        page = ( page - 1 ) * elementsperpage
        items = await database.query('SELECT * FROM items OFFSET ? ROWS FETCH NEXT ? ROWS ONLY', [page, elementsperpage])
    } else {
        items = await database.query('SELECT * FROM items')
    }

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
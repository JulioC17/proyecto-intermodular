const pool = require("../database/conection")


//funcion para saber si un usuario pertenece a la misma empresa que otro
const checkOwnerCompany = async (requesterID, userID) => {
    
    if(Number(requesterID) === Number(userID)){
            throw new Error("SELF_ACTION_NOT_ALLOWED")
        }
    
    const owner = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",
            [requesterID]
        )

    if(owner.rows.length === 0){
             throw new Error("NO_COMPANY_ACCESS")
        }

    const companys = owner.rows.map(c => c.empresa_id)
    
    const ownerCompanys = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE empresa_id = ANY($1) AND usuario_id = $2",
            [companys, userID]
        )
    if(ownerCompanys.rows.length === 0 ){
            throw new Error("TARGET_NOT_ALLOWED")
        }

    return true
}

module.exports = {checkOwnerCompany}
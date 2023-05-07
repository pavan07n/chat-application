const users = []

//Add a user
const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim()

    //Validate the data
        if(!username || !room) {
            return {
                error: 'username and room are required'
            }
        }

        // Check for existing user
        const existingUser = users.find((user) => {
                return user.room === room && user.username === username
        })

        //Validate username 
        if(existingUser) {
            return {
                error: 'user already exits!'
            }
        }

        //Store user
        const user = {id, username, room}
        users.push(user)
        return { user }
}

//Remove a user
const removeUser = (id) => {
        const index = users.findIndex((user) => {
            return user.id === id
        })

        if(index !== -1) {
            return users.splice(index, 1)[0]
        }
}

//Get a user
const getUser = (id) => {
      return users.find((user) => {
       return user.id === id 
      })
}

//Get all users in a room
const getUsersInRoom = (room) => {
        room = room.trim()
   return users.filter((user) => {
     return user.room === room
   })
}


module.exports = {
    addUser, removeUser,
    getUser, getUsersInRoom
}
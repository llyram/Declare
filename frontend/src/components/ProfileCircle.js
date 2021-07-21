import React from 'react';

const ProfileCircle = ({ name, currentName }) => {
    return (
        <div className='profilecirclecontainer'>
            {name === currentName ?
                (<div className="profilecircle currentturn">{name.substring(0, 1).toUpperCase()}</div>  )
                :
                (<div className="profilecircle">{name.substring(0, 1).toUpperCase()}</div>)
            }

        </div>
    )
}

export default ProfileCircle;
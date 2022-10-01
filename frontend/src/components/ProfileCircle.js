import React from 'react';

const ProfileCircle = ({ name, currentName, color }) => {
    const dicebearApi = 'https://avatars.dicebear.com/api/pixel-art/';

    return (
        <div className="flex-centered-column profilecirclediv">
            <div className='profilecirclecontainer'>
                {name === currentName ?
                    (<div className="profilecircle flex-centered currentturn" style={{backgroundColor: color}}><img src={dicebearApi + name + '.svg'} alt={name} /></div>)
                    :
                    (<div className="profilecircle flex-centered" style={{backgroundColor: color}}><img src={dicebearApi + name + '.svg'} alt={name} /></div>)
                }

            </div>
            <h3>{name}</h3>
        </div>
    )
}

export default ProfileCircle;
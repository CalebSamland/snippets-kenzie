import style from './AvatarPicker.module.css'

export const AvatarPicker = ({ avatarOptions, profileImage, setProfileImage }) => {
  
  const handleSelect = (profileUrl) => {
    setProfileImage(`/${profileUrl}`)
  }
  
  return (
    <div>

      {
      avatarOptions.map((avatar, i) => (

        <img 
          src={`/${avatar}`}
          className= {`/${avatar}` === profileImage ? `${style.avatar} ${style.selectedAvatar}` : `${style.avatar}` }    
          key={i}
          alt={avatar}
          onClick={() => handleSelect(avatar)}
        />
      ))
    }
   
  </div>
  )
}

export default AvatarPicker

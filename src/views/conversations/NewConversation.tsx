import logoUrl from '@/assets/yggdrasil.png'
import UserInput from '@/components/conversation/UserInput'

const NewConversation = () => {
  return (
    <>
      <div className="flex h-full w-full flex-col justify-center overflow-auto pb-28">
        <div className="flex h-full flex-1 flex-col justify-center gap-4">
          <h1 className="text-center text-4xl font-medium">Mimir</h1>
          <img src={logoUrl} alt="Yggdrasil" className="mx-auto w-48" />
          <p className="text-center text-xl italic">
            I am Mimir, ask me anything...
          </p>
        </div>
      </div>
      <UserInput />
    </>
  )
}

export default NewConversation

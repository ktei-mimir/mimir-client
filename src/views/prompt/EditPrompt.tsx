import {
  ChangeEvent,
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import Container from '@/components/common/Container'
import produce from 'immer'
import {
  createPrompt,
  CreatePromptRequest,
  listPrompts,
  ListPromptsResponse,
  updatePrompt,
  UpdatePromptRequest
} from '@/api/promptApi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import Button from '@/components/common/Button'
import TextInput from '@/components/common/TextInput'
import TextArea from '@/components/common/TextArea'

type FormData = {
  title: string
  text: string
}

function updateField(state: FormData, name: keyof FormData, value: string) {
  return produce(state, draft => {
    draft[name] = value
  })
}

const EditPrompt = () => {
  const { promptId } = useParams()
  const queryClient = useQueryClient()

  const authenticatedApi = useAuthenticatedApi()

  const fetchPrompts: QueryFunction<ListPromptsResponse> = async () => {
    return await listPrompts(authenticatedApi)
  }

  const { data: prompts } = useQuery('prompts', fetchPrompts, {
    enabled: !!promptId
  })

  const isEditing = useMemo(() => !!promptId, [promptId])

  useEffect(() => {
    if (!promptId) return
    if (!prompts) return
    const prompt = prompts.items.find(p => p.id === promptId)
    if (prompt) {
      setForm({
        title: prompt.title,
        text: prompt.text
      })
    }
  }, [promptId, prompts])

  const [form, setForm] = useState<FormData>({
    title: '',
    text: ''
  })

  const { mutateAsync: createAsync, isLoading: isCreating } = useMutation(
    (request: CreatePromptRequest) => createPrompt(authenticatedApi, request)
  )

  const { mutateAsync: updateAsync, isLoading: isUpdating } = useMutation(
    (request: UpdatePromptRequest) => updatePrompt(authenticatedApi, request)
  )

  const isSaving = useMemo(
    () => isCreating || isUpdating,
    [isCreating, isUpdating]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.name !== 'title') return
      setForm(updateField(form, e.target.name, e.target.value))
    },
    [form, setForm]
  )

  const handleTextAreaChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.name !== 'text') return
      setForm(updateField(form, e.target.name, e.target.value))
    },
    [form, setForm]
  )

  const navigate = useNavigate()

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!form.title || !form.text) return
      if (isEditing) {
        if (!promptId) return
        await updateAsync({
          id: promptId,
          title: form.title,
          text: form.text
        })
      } else {
        await createAsync({
          title: form.title,
          text: form.text
        })
      }
      await queryClient.invalidateQueries('prompts')
      navigate('/conversation')
    },
    [
      updateAsync,
      createAsync,
      form.text,
      form.title,
      isEditing,
      navigate,
      promptId,
      queryClient
    ]
  )

  return (
    <Container>
      <div className="flex justify-center">
        <form
          className="mb-4 w-full bg-white px-8 pb-8 pt-6 shadow-md
          dark:bg-slate-700 sm:max-w-xl sm:self-center md:max-w-2xl lg:max-w-3xl"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-400"
              htmlFor="promptTitle"
            >
              Prompt title
            </label>
            <TextInput
              id="promptTitle"
              placeholder="e.g. Explain code snippet"
              className="mb-2 w-full"
              name="title"
              onChange={handleInputChange}
              value={form.title}
            />
            {/*<p className="text-xs italic text-red-500">*/}
            {/*  Please choose a password.*/}
            {/*</p>*/}
          </div>
          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-400"
              htmlFor="promptText"
            >
              Prompt text
            </label>
            <TextArea
              id="promptText"
              className="h-96 w-full"
              name="text"
              value={form.text}
              onChange={handleTextAreaChange}
              placeholder="e.g. Explain this code snippet...
======= BEGIN CODE SNIPPET =======
${INPUT}
======= END CODE SNIPPET =======
              "
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit" isLoading={isSaving}>
              {isEditing ? 'Save' : 'Create'}
            </Button>
            <Link
              to="/conversation"
              className="inline-block align-baseline text-sm font-bold text-gray-900 hover:text-black dark:text-gray-500 dark:hover:text-gray-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Container>
  )
}

export default memo(EditPrompt)

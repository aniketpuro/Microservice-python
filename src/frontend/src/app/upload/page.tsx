'use client'
import Button from '@/components/ui/Button'
import { useEffect, useState } from 'react'
import getLoginStatus from '@/lib/getLoginStatus'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { IoIosRemoveCircle } from 'react-icons/io'
import styled from 'styled-components'
import axios from 'axios'
import FormError from '@/components/FormErrorMessage'

const getColor = (props: any) => {
  if (props.isDragAccept) {
    return '#00e676'
  }
  if (props.isDragReject) {
    return '#ff1744'
  }
  if (props.isFocused) {
    return '#2196f3'
  }
  return '#bdbdbd'
}
const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
  cursor: pointer;
  margin-bottom: 20px;
  height: 100px;
`

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginStatusMessage, setLoginStatusMessage] = useState('')
  const [isFileUploaded, setIsFileUploaded] = useState(false)

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm()

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({ accept: { 'video/*': ['.mp4', '.mkv'] }, maxFiles: 1 })

  console.log(acceptedFiles)

  useEffect(() => {
    const loginStatus = getLoginStatus()
    setIsLoggedIn(loginStatus.loggedIn)
    setLoginStatusMessage(loginStatus.message)
  }, [])

  useEffect(() => {
    if (acceptedFiles.length == 1) {
      setIsFileUploaded(false)
    }
  }, [acceptedFiles.length])

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      setLoading(true)
      setIsFileUploaded(false)

      if (acceptedFiles.length == 0) {
        setError('file', {
          type: 'manual',
          message: 'Please select a file first before continuing',
        })
        return
      }

      console.log(acceptedFiles[0].name)
      console.log(typeof acceptedFiles[0].name)
      const gatewayIP = (await axios.get('/api/server')).data
      const response = await axios.post(
        '/api/upload',
        {
          file: acceptedFiles[0],
          gatewayIP,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      console.log(response)
      if (response.status == 200) {
        setIsFileUploaded(true)
        acceptedFiles.splice(0, 1)
      }
    } catch (error: any) {
      console.error(error)
      setError('file', {
        type: 'manual',
        message: error.response.data,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="bg-white rounded-md px-5 pt-3 pb-20 w-11/12 max-w-80 relative shadow-2xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-gray-700 text-xl font-bold mt-3 mb-8 pb-5 border-b-[1px]">
        Upload Video File
        {isLoggedIn ? (
          <p className="text-green-500 text-sm mt-2">
            <FaCheckCircle className="inline-block mr-1 font-bold" />
            {loginStatusMessage}
          </p>
        ) : (
          <p className="text-red-500 text-sm mt-2">
            <FaExclamationCircle className="inline-block mr-1 font-bold" />
            {loginStatusMessage}
          </p>
        )}
      </h2>
      <div className="container">
        <Container {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
          <input {...getInputProps()} {...register('file')} />
          <p>Drop video files here</p>
        </Container>
        {!isFileUploaded ? (
          acceptedFiles.length > 0 && (
            <span className="text-green-500 flex items-center">
              <FaCheckCircle className="inline-block mr-1 font-bold" />
              {acceptedFiles[0].name}
              <IoIosRemoveCircle
                className="inline-block text-xl ml-2 text-red-600 cursor-pointer"
                onClick={() => {
                  acceptedFiles.splice(0, 1)
                  location.reload()
                }}
              />
            </span>
          )
        ) : (
          <span className="text-green-500 flex items-center">
            <FaCheckCircle className="inline-block mr-1 font-bold" />
            File uploaded successfully
          </span>
        )}
      </div>
      {errors.file && <FormError message={errors.file.message! as string} />}
      <a href="/download" className="text-sm text-cyan-500 hover:underline">
        Download file?
      </a>
      <Button loading={loading} text="Upload" type="submit" />
    </form>
  )
}

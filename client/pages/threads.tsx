import Threads from '@/components/ThreadsUI'
import React from 'react'

type Props = {}
const defaultThreadData = [
  "lorem",
  `mply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type`,
  `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500`,
  `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 150`,
];

const ThPage = (props: Props) => {
  return (
    <Threads threadDatas={defaultThreadData} />
  )
}

export default ThPage
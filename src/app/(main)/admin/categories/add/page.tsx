'use client'

import React, { useState } from 'react'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'

export default function GroupDemo() {
    const [ingredient, setIngredient] = useState<string>('')

    return (
        <div className='card flex justify-content-center'>
            <div className='flex flex-wrap gap-3'>
                <div className='flex align-items-center'>
                    <RadioButton
                        inputId='ingredient1'
                        name='pizza'
                        value='Cheese'
                        onChange={(e: RadioButtonChangeEvent) => setIngredient(e.value)}
                        checked={ingredient === 'Cheese'}
                    />
                    <label htmlFor='ingredient1' className='ml-2'>
                        Cheese
                    </label>
                </div>
                <div className='flex align-items-center'>
                    <RadioButton
                        inputId='ingredient2'
                        name='pizza'
                        value='Mushroom'
                        onChange={(e: RadioButtonChangeEvent) => setIngredient(e.value)}
                        checked={ingredient === 'Mushroom'}
                    />
                    <label htmlFor='ingredient2' className='ml-2'>
                        Mushroom
                    </label>
                </div>
                <div className='flex align-items-center'>
                    <RadioButton
                        inputId='ingredient3'
                        name='pizza'
                        value='Pepper'
                        onChange={(e: RadioButtonChangeEvent) => setIngredient(e.value)}
                        checked={ingredient === 'Pepper'}
                    />
                    <label htmlFor='ingredient3' className='ml-2'>
                        Pepper
                    </label>
                </div>
                <div className='flex align-items-center'>
                    <RadioButton
                        inputId='ingredient4'
                        name='pizza'
                        value='Onion'
                        onChange={(e: RadioButtonChangeEvent) => setIngredient(e.value)}
                        checked={ingredient === 'Onion'}
                    />
                    <label htmlFor='ingredient4' className='ml-2'>
                        Onion
                    </label>
                </div>
            </div>
        </div>
    )
}

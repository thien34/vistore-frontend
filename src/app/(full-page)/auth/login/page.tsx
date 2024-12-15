/* eslint-disable @next/next/no-img-element */
'use client'
import { useRouter } from 'next/navigation'
import { useContext, useState } from 'react'
import { Checkbox } from 'primereact/checkbox'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'
import { LayoutContext } from '@/components/layout/context/layoutcontext'

const LoginPage = () => {
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [checked, setChecked] = useState(false)
    const { layoutConfig } = useContext(LayoutContext)

    const router = useRouter()
    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    )
    const validate = () => {
        if (email.length === 0) {
            return false
        }
        if (password.length === 0) {
            return false
        }

        return true
    }

    const onLogin = () => {
        if (validate()) {
            console.log("OK")
            router.push('/')
        } else console.log("NOT OK")
    }
    return (
        <div className={containerClassName}>
            <div className='flex flex-column align-items-center justify-content-center'>
                <img
                    src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`}
                    alt='Sakai logo'
                    className='mb-5 w-6rem flex-shrink-0'
                />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className='w-full surface-card py-8 px-5 sm:px-8' style={{ borderRadius: '53px' }}>
                        <div className='text-center mb-5'>
                            <img src='/demo/images/login/avatar.png' alt='Image' height='50' className='mb-3' />
                            <div className='text-900 text-3xl font-medium mb-3'>Chào mừng, Isabel!</div>
                            <span className='text-600 font-medium'>Đăng nhập để tiếp tục</span>
                        </div>

                        <div>
                            <label htmlFor='email1' className='block text-900 text-xl font-medium mb-2'>
                                Email
                            </label>
                            <InputText
                                id='email1'
                                type='text'
                                value={email}
                                placeholder='Email address'
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full md:w-30rem mb-5'
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor='password1' className='block text-900 font-medium text-xl mb-2'>
                                Mật khẩu
                            </label>
                            <Password
                                inputId='password1'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Password'
                                toggleMask
                                className='w-full mb-5'
                                inputClassName='w-full p-3 md:w-30rem'
                            ></Password>

                            <div className='flex align-items-center justify-content-between mb-5 gap-5'>
                                <div className='flex align-items-center'>
                                    <Checkbox
                                        inputId='rememberme1'
                                        checked={checked}
                                        onChange={(e) => setChecked(e.checked ?? false)}
                                        className='mr-2'
                                    ></Checkbox>
                                    <label htmlFor='rememberme1'>Ghi nhớ tôi trên thiết bị này</label>
                                </div>
                                <a
                                    className='font-medium no-underline ml-2 text-right cursor-pointer'
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                            <Button
                                label='Đăng nhập'
                                className='w-full p-3 text-xl'
                                onClick={onLogin}
                            ></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage

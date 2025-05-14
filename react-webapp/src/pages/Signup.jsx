import React, {useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';


export default function Login() {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    
    const [emailValid, setEmailValid] = useState(false);
    const [pwValid, setPwValid] = useState(false);
    const [notAllow, setNotAllow] = useState(false);
    
    const navigate = useNavigate();

    const handleEmail = (e) => {
        setEmail(e.target.value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailRegex.test(email)) {
            setEmailValid(true);
        }
        else {
            setEmailValid(false);
        }
    }

    const handlePw = (e) => {
        setPw(e.target.value);
        const pwRegex  = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/ // 영문 숫자 조합 8자리 이상
        if (pwRegex.test(pw)) {
            setPwValid(true);
        }
        else {
            setPwValid(false);
        }
    }

    const onClickConfirm = () => {
        alert('회원가입이 완료되었습니다.')
        navigate('/');
    }

    const handleSignup = async (e) => {
        e.preventDefault(); // 새로고침 방지
        navigate('/'); // 로그인 성공 시 홈으로 이동

        // const success = await fakeLogin(email, password);
        // if (success) {
        // } else {
        //     alert('로그인 실패');
        // }
    };

    useEffect( () => {
        if (emailValid && pwValid) {
            setNotAllow(false);
            return;
        }
        setNotAllow(true);
    }, [emailValid, pwValid]);

    return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSignup}>
          <h2 className="text-center text-2xl font-bold mb-4">로그인</h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text">이메일</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="input input-bordered"
              value={email}
              onChange={handleEmail}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">비밀번호</span>
            </label>
            <input
              type="pw"
              placeholder="영문 숫자 조합 8자리 이상"
              className="input input-bordered"
              value={pw}
              onChange={handlePw}
              required
            />
          </div>

          <div className='errorMessageWrap'>
            {
                !emailValid && email.length > 0 && (
                    <div>올바른 이메일을 입력해주세요.</div>
                )
            }
          </div>

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">
              가입
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
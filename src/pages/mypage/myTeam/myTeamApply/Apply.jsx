import React from 'react';
import S from './StyleApply';
import Paging from '../../_component/Paging';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

const Apply = ({ PAGINATION, currentList, page, setPage, totalPost, jwtToken, getTeamManagment, navigate }) => {
  const { currentUser } = useSelector((state) => state.user)

  const handleTeamDelete = async (applyId) => {
    const confirmDelete = window.confirm("정말로 팀 지원을 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:8000/showu/team/apply/remove/${applyId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          alert("팀 지원이 성공적으로 삭제되었습니다.");
          await getTeamManagment();
          navigate("/my-team/apply"); 
        } else {
          alert(data.message || "팀 지원 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("팀 지원 삭제 중 오류 발생:", error);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  }
  
  console.log("currentList", currentList)

  return (
    <>
      <S.Container>
        <S.Wrapper>
      
          { currentList && currentList.map((item, i) => (
            <S.LessonBox key={i}>

              <S.UpdateAndDeleteButton >
                <div 
                  className='updateButton'
                  onClick={() => navigate(`/showu/team/apply/up-date/${item._id}`)}
                >
                  <FontAwesomeIcon icon={faPen} className='pen' />
                </div>
                <div 
                  className='deleteButton'
                  onClick={() => handleTeamDelete(item._id)}
                >
                  <FontAwesomeIcon icon={faXmark} className='xmark' />
                </div>
              </S.UpdateAndDeleteButton>

              <ul>
                <S.UserInfo>  
                  <img src={`http://localhost:8000${item.teamId.teamProfile}`} alt="team profile"></img>
                  <div>
                    <li>{item.teamId.teamName}</li>
                    <li className='teamName'>{item.applyId.name}</li>
                    <li className='category'>{item.applyId.role}</li>
                  </div>
                </S.UserInfo>

                <S.Hr />

                <S.category>
                  <li className='category'>{item.upgradeId.field}</li>
                  <li className='applyStatus'>{item.applyStatus}</li>
                </S.category>

                <S.LessonExplantion>
                  <div className='intro'>
                    <li className='lessonDetail'>{item.intro}</li>
                  </div>
                  <div>
                    <span>{item.career}</span>
                    {/* <p>{calculateDDay(team.deadLine)}</p> */}
                  </div>

                  <div>
                    <p>{item.upgradeId.area}</p>
                    <p>{item.upgradeId.total}</p>
                  </div>

                  {/* <S.Career>
                    <FontAwesomeIcon icon={faThumbtack} />
                    <li className='lessonName'>{team.careerHistory}</li>
                  </S.Career> */}

                </S.LessonExplantion>

                {/* <S.Period>
                  <FontAwesomeIcon icon={faCalendarDays} />
                  <li>{item.deadLine}</li>
                </S.Period> */}
              </ul>
          </S.LessonBox>
          ))}

          <Paging
            page={page}
            setPage={setPage}
            totalPost={totalPost}
            btnRange={PAGINATION.btnRange}
            pageRange={PAGINATION.pageRange}
          />

        </S.Wrapper>
      </S.Container>
      </>
  );
};

export default Apply;
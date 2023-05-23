import { useEffect,useState } from "react";
import styled from "styled-components";
import PostModal from "./PostModal";
import { connect } from "react-redux";
import { getArticlesAPI } from "../../actions";
import ReactPlayer from "react-player";
import fuzzyTime from "fuzzy-time";
import {updateDoc,doc,deleteDoc} from "firebase/firestore";
import { db } from "../../firebase";
import Comment from "./Comment";


const Main = (props) => {
  const [showModal,setShowModal]=useState("close");
  const [showComments, setShowComments] = useState([]);
  const [showEditPost,setShowEditPost]=useState(false);

  useEffect(()=>{
    props.getArticles();
  },[]);

  const fetchLikes = (articleId, likes) => {
    const updatedLikes = likes.some((l) => l.email === props.user.email)
      ? likes.filter((l) => l.email !== props.user.email)
      : [
          { name: props.user.displayName, email: props.user.email, photo: props.user.photoURL },
          ...likes,
        ];
  
    // Update the likes in the database or API
    updateDoc(doc(db, "articles", articleId), {
      likes: updatedLikes,
    });
  };

  const deletePost = (id) => {
    deleteDoc(doc(db, "articles", id));
  };
  

  const handleClick=(e)=>{
    e.preventDefault();
    if(e.target!==e.currentTarget){
      return;
    }
    


    switch(showModal){
      case "open":
        setShowModal("close");
        break;
      case "close":
          setShowModal("open");
          break;
      default:
        setShowModal("close");
        break;
        
    }
  }
  return( 
    <>
    
  <Container>
    <ShareBox>
    <div>
      { props.user && props.user.photoURL ? (
      <img src={props.user.photoURL}/>
      ):(
      <img src="/images/user.svg" alt=""/>      
      )}
        <button onClick={handleClick}
        disabled={props.loading ? true:false}>
          Start a post
          </button>
      </div>
      <div>
        <button>
          <img src="/images/photo-icon.svg" className="feed-images" alt=""/>
          <button onClick={handleClick}
                  disabled={props.loading ? true:false}
                  className="uploading"
          >
               Photo
          </button>
        </button>
        <button>
          <img src="/images/video-icon.svg" className="feed-images" alt=""/>
          <button onClick={handleClick}
                  disabled={props.loading ? true:false}
                  className="uploading"
          >
               Video
          </button>
        </button>
        <button>
          <img src="/images/poll-icon.svg" className="feed-images" alt=""/>
          <span>Poll</span>
        </button>
      </div>
    </ShareBox>
    <Content>
      {
        props.loading && <img src='./images/spin-loader.svg'/>
      }
    {props.articles.length>0 &&
    props.articles.map((article,key)=>(
      <Article key={key}>
        <SharedActor>
          <a>
            <img src={article.actor.image} alt=""/>
            <div>
              <span>{article.actor.title}</span>
              <span>{article.actor.description}</span>
              <span>{fuzzyTime(article.actor.date)}</span>
            </div>
          </a>
          <button onClick={() => setShowEditPost((prev)=>(prev===article.id ? null :article.id))}> 
          {article.actor.description === props.user.email && (
          <img src="./images/ellipsis.svg" alt=""/>
          )}
          </button>
          {showEditPost === article.id && article.actor.description === props.user.email && (
                <EditModel>
                  
                    <li onClick={() => deletePost(article.id)}>
                      <img src="/images/delete.webp" alt="" />
                      <h6>Delete post</h6>
                    </li>
                </EditModel>
              )}
          </SharedActor>
          <Description>
            {article.description}
          </Description>
          <SharedImg>
            <a>
              {
                !article.shareImg && article.video ? (<ReactPlayer width={'100%'} height={'50%'} url={article.video} controls={true} />
                ):(
                  article.shareImg && <img src={article.shareImg}/>
                )
              }
            </a>
          </SharedImg>
          <SocialCounts>
          <li>
                {article.likes.length > 0 && (
                  <img
                    className="likes"
                    src="images/red-hearts.svg"
                    alt=""
                  />
                )}
                <span className="likes">
                {article.likes.length} {article.likes.length === 1 ? " like • " : " likes •"}
                </span>
              </li>
              <li onClick={() => setShowComments((prev) => [...prev, article.id])}>
              <p className="comments">{article.comments ? (article.comments.length === 1 ? '1 comment' : `${article.comments.length} comments`) : '0 comments'}</p>

              </li>
          </SocialCounts>
          <SocialActions>
          <button
      className={
        article.likes.some((l) => l.email === props.user.email) ? "active" : ""
      }
      onClick={(e) => {
        fetchLikes(article.id, article.likes);
      }}
    >
                <img className="unLiked" src='/images/like-icon.svg' alt="" />
                <img
                  className="liked"
                  src='/images/liked-icon.svg'
                  alt=""
                />
  </button>
  <button onClick={() => setShowComments((prev) => [...prev, article.id])}>
            <img src="/images/comment-icon.svg" className="review" alt=""/>
            <span></span>
          </button>
          
          </SocialActions>
          {showComments.includes(article.id) && (
              <Comment
                photo={props.user?.photoURL}
                comments={article.comments}
                user={props.user}
                id={article.id}
              />
            )}
      </Article>
    ))}
      </Content>
      <PostModal showModal={showModal} handleClick={handleClick} />
    </Container>

    </>
    );
};
  

const Container = styled.div`
  grid-area: main;
`;
const CommonCard = styled.div`
  text-align:center;
  overflow:hidden;
  margin-bottom:8 px;
  background-color:#fff;
  border-radius:5 px;
  position:relative;
  border:none;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%);
`;

const ShareBox=styled(CommonCard)`
 display:flex;
 flex-direction:column;
 color:#ffff;
 margin:0 0 8px;
 background:white;
 div{
    button{
      outline:none;
      color:rgb(0,0,0,.6);
      font-size:14px;
      line-height:1.5;
      min-height:48px;
      background:transparent;
      border:none;
      display:flex;
      align-items:center;
      font-weight:600;
    }
    :first-child{
      display:flex;
      align-items: center;
      padding:8px 16px 0px 16px;
      img{
        width:48px;
        border-radius:50%;
        margin-right:8px;
      }
      button{
        margin:4px 0;
        flex-grow:1;
        border-radius:35px;
        padding-left:16px;
        border:1px solid rgba(0,0,0,.15);
        background-color:white;
        text-align:left;
      }
    }
    :nth-child(2){
      display:flex;
      flex-wrap:wrap;
      justify-content:space-around;
      padding-bottom:4px;
      button{
        img{
          margin:0 4px 0 -2px;
        }
        span,.uploading{
          color:#70b5f9;
          cursor:pointer;
        }
      }
    }
    .feed-images{
      display:flex;
      width:28px;
      margin-right:8px;
    }
 }
  `;
const Article=styled(CommonCard)`
padding:0;
margin:0 0 8px;
overflow:visible;
`;

const SharedActor=styled.div`
padding-right:40px;
flex-wrap:nowrap;
padding:12px 16px 0;
margin-bottom:8px;
align-items:center;
display:flex;
a{
  margin-right:12px;
  flex-grow:1;
  overflow:hidden;
  display:flex;
  text-decoration:none;

  img{
    width:48px;
    height:48px;
  }
  >div{
    display:flex;
    flex-direction:column;
    flex-grow:1;
    flex-basis:0;
    margin-left:8px;
    overflow:hidden;

    span{
      text-align:left;
      :first-child{
        font-size:14px;
        font-weight:700;
        color:rgba(0,0,0,1);
      }
      :nth-child(n+1){
        font-size:12px;
        color:rgba(0,0,0,0.6);
      }
    }
  }
}
button{
  position:absolute;
  right:12px;
  top: 0;
  background:transparent;
  border:none;
  outline:none;
  padding:.5px;
}
`;

const EditModel = styled.ul`
  animation: fadeIn 0.5s;
  text-align: start;
  position: absolute;
  right: 5px;
  top: 55px;
  background-color: white;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 6px 9px rgb(0 0 0 / 20%);
  border-radius: 8px;
  overflow: hidden;
  z-index: 99;
  min-width: 250px;
  li {
    display: flex;
    padding: 10px;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
    img {
      width: 18px;
      height: 20px;
    }
    h6 {
      font-size: 14px;
      color: rgba(0, 0, 0, 1);
      font-weight: 600;
    }
    .info {
      text-align: start;
      span {
        font-size: 12px;
        display: block;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
`;


const Description=styled.div`
padding:0 16px;
overflow:hidden;
color:rgba(0,0,0,.9);
font-size:14px;
text-align:left;
  `;

const SharedImg=styled.div`
margin-top:8px;
width:100%;
display:block;
position:relative;
background-color:#f9fafb;
img{
  object-fit:contain;
  width:100%;
  height:100%;
}
`;

const SocialCounts=styled.ul`
line-height:2.3;
display:flex;
align-items:flex-start;
overflow:auto;
margin:0 16px;
padding:8px 0;
border-bottom:1px solid #e9e5df;
list-style:none;
.likes{
  justify-content:flex-start;
  margin-right:5px;
}

li{
  display:flex;
  align-items:center;
  margin-right:5px;
  font-size:13px;
  button{
    display:flex;
    border:none;
    background-color:white;
  }
  img{
    width:25px;
    
  }
  .comments{
   cursor:pointer;
  }
}
`;
const SocialActions=styled.div`
align-items:center;
display:flex;
margin:0;
justify-content:flex-start;
min-height:40px;
padding:4px 8px;
button{
  display:inline-flex;
  align-items:center;
  padding:8px;
  background:transparent;
  border:none;
  .liked{
      display:none;
      width:30px;
    }
    .unLiked{
      display:flex;
     width:30px;
    }

    &:hover{
      background-color: rgba(0, 0, 0, 0.08);
    }

    &.active {
      color: #ab0c1c;
      .liked{
        display: inline-block;
      }
      .unLiked {
        display: none;
      }
    }
  @media(min-width:768px){
  }

  .review{
  display:flex;
  width:25px;
  
}
}
`;
const Content=styled.div`
    text-align:center;
    &>img{
      width:30px;
    }
`;

const mapStateToProps=(state)=>{
  return{
    loading:state.articleState.loading,
    user:state.userState.user,
    articles:state.articleState.articles.map((article)=>({
      ...article,
      id:state.articleState.articles.find((a)=>a.id===article.id)
      .id,
    })),
    articleIDs: state.articleState.articles.map((article) => article.id),
  };
};
const mapDispatchToProps=(dispatch)=>({
      getArticles:()=>dispatch(getArticlesAPI()),
});
export default connect(mapStateToProps,mapDispatchToProps)(Main);
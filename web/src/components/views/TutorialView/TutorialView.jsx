import React, {useState, useEffect} from 'react';
import MButton from '../../ui/MButton';
import Navbar from '../../navbar/navbar';
import tutorialScreen1 from 'images/tutorials/1.png';
import tutorialScreen2 from 'images/tutorials/2.png';
import tutorialScreen3 from 'images/tutorials/3.png';
import tutorialScreen4 from 'images/tutorials/4.png';
import './TutorialView.scss';

const TutorialView = (props) => {
  const {history} = props;

  const [activePage, setActivePage] = useState(1);

  const onNextPage = () => {
    if (activePage === 4) {
      history.push('/welcome');
    } else {
      setActivePage(activePage + 1);
    }
  };

  useEffect(() => {
    const handleKeyPress = ({code}) => {
      if (code === 'Enter') {
        onNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, [activePage]);

  return (
    <div className='tutorial-view'>
      <Navbar />
      <div className='tutorial-view_content'>
        <div className={`tutorial-view_content_slides show-page${activePage}`}>
          <div className='tutorial-view_content_slides_page page1'>
            <h2 className="title-lg">In MLReef you will find two major repository types:</h2>
            <div className="content page1_content">
              <img className='image image1' src={tutorialScreen1} alt="" />
              <div className="page1_labels">
                <label className="image1_label1">"ML Projects" host your data and is<br />where you run pipelines and experiments.</label>
                <label className="image1_label2">"Code Repositories" manage your code functions<br/> for specific steps in the ML life cycle.</label>
              </div>
            </div>
          </div>

          <div className='tutorial-view_content_slides_page page2'>
            <h2 className="title-lg">These can be published into runnable<br />and immutable "AI Modules".<br />All Code Repositories - published or not - can be found in the "AI Library".</h2>
            <div className="content page2_content">
              <img className='image image1' src={tutorialScreen2} alt="" />
            </div>
          </div>

          <div className='tutorial-view_content_slides_page page3'>
            <h2 className="title-lg">Published AI Modules are then accessible<br />in the dedicated pipelines within ML Projects.</h2>
            <div className="content page3_content">
              <img className='image image1' src={tutorialScreen3} alt="" />
            </div>
          </div>

          <div className='tutorial-view_content_slides_page page4'>
            <h2 className="title-lg">All repositories are based on git.<br />Share, reproduce and track all steps up to the final<br /> and best performing model.</h2>
            <div className="content page4_content">
              <img className='image image1' src={tutorialScreen4} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className='tutorial-view_footer'>
        <MButton type="submit" className="btn btn-primary" onClick={onNextPage}>
          Got it!
        </MButton>
        <label>(press enter)</label>
      </div>
    </div>
  );
};

TutorialView.propTypes = {

};

export default TutorialView;

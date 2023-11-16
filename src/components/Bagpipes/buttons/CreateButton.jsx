// @ts-nocheck
import React from 'react';
import { PlusIcon } from '../../Icons/icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import '../nodes.jsx';
import '../../../index.css';
import './Buttons.scss';
import { buttonDescriptions}  from './buttonDescriptions';

export const CreateButton = ({createScenario}) => {
    return (
        <Tippy  theme='light' content={buttonDescriptions.newFlow}>
        <button 
        className="start-stop-create-button" 
        onClick={createScenario} 
        >
            {PlusIcon}
    {/* New Flow         */}
        </button>
        </Tippy>
    );
}

export default CreateButton;


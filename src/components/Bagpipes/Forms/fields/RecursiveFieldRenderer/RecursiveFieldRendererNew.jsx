import React, { useState, useEffect } from 'react';
import CustomInput from '../CustomInput';
import { Select } from 'antd';
import { CompositeField, SequenceField} from '../SubstrateMetadataFields';
import { resolveFieldType } from '../../PopupForms/ChainForms/parseMetadata/resolveFieldType';
import useAppStore from '../../../../../store/useAppStore';
import { initializeFormData, initializeDefaultValues, generatePath, handleChange } from './utils';
import _ from 'lodash';
import useTooltipClick  from '../../../../../contexts/tooltips/tooltipUtils/useTooltipClick';
import { usePanelTippy } from '../../../../../contexts/tooltips/TippyContext';
import '../../PopupForms/ChainForms/ChainTxForm/DynamicFieldRenderer';
import './RecursiveFieldRenderer.scss';



const { Option } = Select;

const RecursiveFieldRenderer = ({ fieldObject, formValues, onChange, nodeId, pills, setPills, onPillsChange, fieldName, fieldPath, fromType }) => {

    console.log(`RecursiveFieldRenderer - CYCLE CHECK fieldObject, formValues, fieldName, nodeId, ${fieldPath}`, { fromType, fieldObject, formValues, fieldName, nodeId, fieldPath });

    /// For the Panel Form... Notify that content has changed
    const { tippyPanelInstance } = usePanelTippy();
    const handleContentChange = () => {  if (tippyPanelInstance.current && tippyPanelInstance.current.popperInstance) { tippyPanelInstance.current.popperInstance.update(); } };
    const { handleInputClick } = useTooltipClick(nodeId, handleContentChange);
    ///

    const { scenarios, activeScenarioId, saveNodeFormData, clearSignedExtrinsic, markExtrinsicAsUsed, updateNodeResponseData } = useAppStore(state => ({ 
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
        saveNodeFormData: state.saveNodeFormData,
        clearSignedExtrinsic: state.clearSignedExtrinsic,
        markExtrinsicAsUsed: state.markExtrinsicAsUsed,
        updateNodeResponseData: state.updateNodeResponseData,
       }));

    const formData = scenarios[activeScenarioId]?.diagramData?.nodes.find(node => node.id === nodeId)?.formData || {};
    const [selectedIndex, setSelectedIndex] = useState('');
    const fieldType = fieldObject.type;

    console.log(`RecursiveFieldRenderer - CHECKING ${fieldType} 1. fieldObject, formValues, fieldName, nodeId, fieldPath:`, { fieldObject, fieldName, nodeId, fieldPath });

    const handleVariantChange = selectedValue => {
        const selectedVariant = fieldObject.variants.find(variant => variant.index === selectedValue);
        if (selectedVariant && selectedIndex !== selectedValue) { // Check if really needs updating
            console.log(`RecursiveFieldRenderer - variant 2.  handleSelectChange selectedValue, selectedVariant, selectedIndex:`,{ selectedValue, selectedVariant, selectedIndex });
            setSelectedIndex(selectedValue);                
        }
    }


    const handleInputChange = (path, newValue) => {

        console.log(`RecursiveFieldRenderer - input handleInputChange about to change formValues input:`,{ path, newValue, formValues });
        let updatedParams = _.set(formData.params, path, newValue);
        console.log(`RecursiveFieldRenderer - input updated params after handleInputChange input:`, updatedParams);
        // saveNodeFormData(activeScenarioId, nodeId, { ...formData, params: updatedParams });

    };
    const getFormDataForInput = _.get(formData, `params.${fieldPath}`, '')
    console.log('RecursiveFieldRenderer - input getFormDataForInput:', getFormDataForInput, fieldPath);


    if (!getFormDataForInput) {
        console.log('RecursiveFieldRenderer - input 1. no getFormDataForInput:', fieldObject, getFormDataForInput, fieldPath);
        const initialValue = initializeDefaultValues(fieldObject, fieldPath, 'fromInput');

    handleChange(fieldPath, initialValue, false, 'input', formData);

    }


    // useEffect(() => {
    //     console.log(`RecursiveFieldRenderer - variant effect 0. selectedIndex, fieldObject.variants, formData, fieldPath:`, { selectedIndex, fieldObject, formData, fieldPath });
    //     if (selectedIndex !== null && fieldType == 'variant') {
    //         const selectedVariant = fieldObject.variants?.find(variant => variant.index === selectedIndex);
    //         const variantParamsPath = `params.${fieldPath}`; // Assuming fieldPath includes the path to the variant
    //         const existingVariantData = _.get(formData, variantParamsPath);
    //         console.log(`RecursiveFieldRenderer - variant effect 0a. selectedVariant, variantParamsPath, existingVariantData:`, { selectedVariant, variantParamsPath, existingVariantData });
    
    //         if (!existingVariantData && selectedVariant) {
    //             console.log(`RecursiveFieldRenderer - variant effect 1. Initialize:`, { selectedVariant, fieldPath });
    //             const initialValues = {};
    
    //             selectedVariant.fields.forEach(field => {
    //                 console.log(`RecursiveFieldRenderer - variant effect 1i. Initialize:`, { field });
    //                 initialValues[field.name] = initializeDefaultValues(field.resolvedType, `${variantParamsPath}.${field.name}`);
    //             });
    
    //             console.log(`RecursiveFieldRenderer - variant effect 2. Initialized Values:`, initialValues);
    //             handleChange(fieldPath, initialValues, false, 'variant', formData);  // Set initialized data into state
    //         }
    //     }
    // }, [selectedIndex]);
    

    switch (fieldType) {
        case 'input':
            console.log('RecursiveFieldRenderer - input formValues, fieldObject:', { fieldPath, fieldName, formValues, fieldObject, fieldType });   
            console.log('RecursiveFieldRenderer - input fieldPath formValues:', { fieldPath, formValues }); 


            // we wan to get the prev id of the field path, so we can use it to get the previous value.
            const prevId = fieldObject?.path?.[fieldObject.path.length - 2]?.id;
            console.log('RecursiveFieldRenderer - input prevId:', prevId);



            return (
                <div className='mt-2 mb-4'>
                    <label className='font-semibold'>{fieldName ? `input: ${fieldName || "input"} <${fieldObject.typeName}>` : `input: <${fieldObject.typeName}>`}</label>
                    <CustomInput
                        key={prevId}
                        value={getFormDataForInput} 
                        onChange={newValue => handleInputChange(fieldPath, newValue)}
                        onPillsChange={onPillsChange}
                        placeholder={`Enter ${fieldObject.typeName}`}
                        className='custom-input'
                        pills={pills}
                        setPills={setPills}
                        nodeId={nodeId}
                        onClick={handleInputClick} 
                    />
                </div>
            );

        
        case 'variant':

  

            
            const fieldDataPath = fieldPath;
            const existingData = _.get(formData, fieldDataPath);
            console.log('RecursiveFieldRenderer - variant 1a. existingData:', { existingData,fieldDataPath, formData });


            if (!selectedIndex) {
                console.log('RecursiveFieldRenderer - variant 1b. assigning selectedIndex value:', { selectedIndex, fieldPath });
                setSelectedIndex(fieldObject.variants[0].index);
                // handleChange(fieldPath, { [defaultName]: initialValues }, false, 'variant', formData);

            } else {
                console.log('RecursiveFieldRenderer - variant 1b. already selectedIndex value:', { selectedIndex, fieldPath });

            }
            if (!existingData ) {

            console.log('RecursiveFieldRenderer - variant 1b. check:', { existingData, fieldPath});
    
            let defaultVariant = fieldObject.variants[0]
            let defaultIndex =  defaultVariant.index;
            let defaultName = defaultVariant.name;
            let initialValues = {}; // Assuming you've initialized these values
            
            console.log('RecursiveFieldRenderer - variant 2b. defaultVariant, defaultIndex, defaultName, initialValues:', { fieldObject, defaultIndex, defaultName, initialValues, fieldPath, existingData });

            handleChange(fieldDataPath, initialValues, false, 'variant', formData);

            const variantPathName = generatePath(fieldDataPath, defaultName, fieldType, 'variantZero');

            // Initialize the sub fields of the default variant 
            defaultVariant.fields.forEach(field => {
               
                console.log('RecursiveFieldRenderer - variant 2bi. field:', { field, fieldPath, defaultName });
                const fieldPathName = generatePath(variantPathName, field.name, field.resolvedType.type, 'variantOneA');
                const fieldPathVariant = generatePath(fieldPathName, defaultName, 'variant', 'variantOneB')
                initialValues = initializeDefaultValues(field.resolvedType, fieldPathName, 'fromVariant');
                console.log('RecursiveFieldRenderer - variant 2bi. initializedValue:', { initialValues, fieldPathVariant, fieldPathName, fieldPath, field, defaultName });
                // _.set(formData, `params.${fieldPath}.${defaultName}`, initialValues);
                
                handleChange(fieldPathName, initialValues, false, 'variant', formData);


            })

                // setSelectedIndex(defaultIndex);

                // const initializedData = initializeFormData(defaultVariant, defaultIndex, formData, fieldPath);

                console.log('RecursiveFieldRenderer - variant 2c. defaultName:', defaultName, fieldPath);

            
                //  handleChange(fieldPath, { [defaultName]: initialValues }, false, 'variant', formData);

                let updatedParams = { ...formData.params };
                let currentValue = _.get(updatedParams, fieldPath, null);

                if (!currentValue && fieldType === 'variant') {
                    // _.set(updatedParams, fieldPath, { [defaultName]: initialValues });
                    handleChange(fieldPath, { [defaultName]: initialValues }, true, 'variant', formData);
                }

                // let currentVariantPath = `${fieldPath}.${defaultName}`;
                let currentVariantPath = `${fieldPath}`;
                console.log(`RecursiveFieldRenderer - ${fieldType} 2f. handleChange currentVariantPath:`, currentVariantPath, defaultName);

                // what does _.get do? "get" is a lodash function that allows you to get the value of a nested property from an object. If the property does not exist, it returns undefined. does it change the object? No, it does not change the object.
                let currentVariantValue = _.get(updatedParams, currentVariantPath, null);
                console.log(`RecursiveFieldRenderer - ${fieldType} 2h. handleChange currentVariantPath, currentVariantValue:`, { currentVariantPath, currentVariantValue });
           
            }  

            const selectedValue = _.get(formData.params, `${fieldPath}`, '');
            console.log('RecursiveFieldRenderer - variant 2i. selectedValue:', selectedValue, fieldPath);
            const objectKeys = Object.keys(selectedValue); // This will give us ['V2']
            console.log('RecursiveFieldRenderer - variant 2j. objectKeys:', objectKeys, fieldPath);

            const displayKey = objectKeys.length > 0 ? objectKeys[0] : 'No keys found';

            return (
                <div className='variant-container'>
                    <div className='variant-selector'>
                        <Select
                            value={selectedIndex}
                            onChange={handleVariantChange}
                            className='w-full font-semibold custom-select'
                            placeholder="Select option"
                            getPopupContainer={trigger => trigger.parentNode}
                        >
                            {fieldObject.variants.map(variant => (
                                <Option key={variant.index} value={variant.index}>{variant.name}</Option>
                            ))}
                        </Select>
                    </div>
                    {selectedIndex !== null && fieldObject.variants.find(variant => variant.index === selectedIndex)?.fields.map((field, index) => {
                        console.log('RecursiveFieldRenderer - variant field before fieldVariantPath:', field, fieldPath);
                        const variantPath = generatePath(fieldPath, selectedIndex, 'variantField', 'variantSecond');
                        const fieldVariantPath = generatePath(variantPath, field.name, field.resolvedType.type, 'variantThird');
                        // const fieldVariantPath = `${fieldPath}.${defaultName}`;
                        console.log('RecursiveFieldRenderer - variant field rrr:',{ fieldVariantPath, field, fieldPath}, field.name, field.resolvedType.type);
            
                        return(
                            <div className='variant-field' key={index}>
                                <label className='font-semibold'>{`variant field: ${field?.name} <${field?.resolvedType?.typeName}>`}</label>
                                <RecursiveFieldRenderer
                                    fieldObject={field.resolvedType}
                                    formValues={_.get(formData, `params.${fieldVariantPath}`, {})}
                                    fieldPath={fieldVariantPath.selectedIndex}
                                    nodeId={nodeId}
                                    fromType={'variantField'}

                                    />
                            </div>
                        );
                    })}
                </div>
            );

        
      
            
                    
        case 'composite':
            console.log('RecursiveFieldRenderer - composite 1a. :', { fieldObject, fieldPath });
    
        
            // Ensure that the composite fields are initialized properly
            const compositeParamsPath = fieldPath;
            console.log('RecursiveFieldRenderer - composite 1ai.  compositeParamsPath:', compositeParamsPath);
            
            const existingCompositeData = _.get(formData, compositeParamsPath);
            if (!existingCompositeData && fieldObject.type === 'composite') {
                const initialValues = {};
                fieldObject.fields.forEach(field => {
                    initialValues[field.name] = initializeDefaultValues(field.resolvedType, `${compositeParamsPath}.${field.name}`); 
                });
                handleChange(fieldPath, initialValues, false, 'composite', formData); // Set initialized data into state
            } else {
                console.log('RecursiveFieldRenderer - composite 2c. already existingCompositeData:', existingCompositeData, fieldPath);
            }
            
            return (
                <div className="composite-container">
                    {fieldObject.fields.map((field, index) => {

                        const subFieldPath = generatePath(fieldPath, field.name, 'compositeField');
                        // const subFieldPath = `${fieldPath}.${field.name}`;
                        console.log('RecursiveFieldRenderer - composite initialize composite rrr 3. subFieldPath:', fieldPath, field, subFieldPath, field.resolvedType);
                        return (
                            <div key={index} className="composite-field">
                                <label className='font-semibold'>{`composite: ${field?.name} <${field?.resolvedType?.typeName}>`}</label>
                                <RecursiveFieldRenderer
                                    fieldObject={field.resolvedType}
                                    formValues={formData.params?.[subFieldPath] || {}}
                                    fieldPath={subFieldPath}
                                    nodeId={nodeId}
                                    fieldName={field.name}
                                    fromType={'compositeField'}
                                />
                            </div>
                        );
                    })}
                </div>
            );
        
        case 'sequence':             
            console.log('RecursiveFieldRenderer - sequence:', fieldObject);
            // Initialize sequence items safely by checking if the path points to an array
            // Initialization and state management for sequence items
            const [items, setItems] = useState(() => {
                // Assuming formData.params[fieldPath] is directly the array for this sequence
                return formData.params?.[fieldPath] ? formData.params?.[fieldPath].map((item, index) => ({
                    value: item,
                    pathKey: `${fieldPath}[${index}]`, // Directly constructing pathKey
                })) : [];
            });
                            
            // Add new item to the sequence
            const handleAddItem = () => {
                const newItemDefaultValue = initializeDefaultValues(fieldObject.elementType, fieldPath, 'sequenceDefault'); // Default values based on type
                const newItem = { value: newItemDefaultValue, pathKey: `params[${items.length}]` }; // Adjust pathKey to array access
                const updatedItems = [...items, newItem];
                setItems(updatedItems);
                handleChange(`params[${items.length}]`, newItemDefaultValue, false, 'sequence', formData);
            };

            // Remove item from the sequence
            const handleRemoveItem = (index) => {
                const newItems = items.filter((_, i) => i !== index);
                setItems(newItems);
                // Assuming `fieldPath` correctly points to the array in `params`
                // Update the array at the specific path to reflect the removal of the item
                const updatedArray = newItems.map(item => item.value);
                // Properly setting the entire sequence array
                const updatedParams = [...formData.params];
                _.set(updatedParams, fieldPath, updatedArray);  // Replace the entire sequence array at the field path
                // saveNodeFormData(activeScenarioId, nodeId, { ...formData, params: updatedParams });
                handleChange(fieldPath, updatedArray, true, 'sequence', formData);
            };

            // Update an item in the sequence
            const handleChangeItem = (index, newValue) => {
                const itemPath = items[index].pathKey;
                handleChange(itemPath, newValue, true, 'sequence', formData);
                const updatedItems = [...items];
                updatedItems[index].value = newValue;
                setItems(updatedItems);
            };

            // Render sequence items
            return (
                <div className='sequence-container'>
                    <div className='add-remove-box'>
                        <button className='sequence-button' onClick={handleAddItem}>
                            <div className='add-button'>+</div>
                            <label>Add item</label>
                        </button>
                    </div>
                    {items.map((item, index) => (
                        <React.Fragment key={item.pathKey}>
                            <label className='sequence-field-label'>{`${index}: <${fieldObject.typeName}>`}</label>
                            <div className='sequence-item'>
                                <RecursiveFieldRenderer
                                    fieldObject={fieldObject.elementType}
                                    formValues={item.value}
                                    onChange={(newValue) => handleChangeItem(index, newValue)}
                                    nodeId={nodeId}
                                    fieldPath={item.pathKey}
                                    fromType={'sequenceField'}
                                />
                            </div>
                            <div className='add-remove-box'>
                                <button className='sequence-button' onClick={() => handleRemoveItem(index)}>
                                    <div className='remove-button'>-</div>
                                    <label>Remove item</label>
                                </button>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            );

        
        // an array just displays other fields it doesnt really do changing, so maybe should just pass it through. The reason why i say this is because if i select a variant within an array, the formObject that is passed in, does not go into the nested object it just passes what is already there. Therefore the next fields are not rendered. 
        case 'array':
            console.log('RecursiveFieldRenderer - array:', fieldObject);
        
            // Initialize array items based on existing formValues or provide defaults.
            const initialArrayItems = formValues?.[fieldName] || Array.from({ length: fieldObject.length }, () => ({}));
            const [arrayItems, setArrayItems] = useState(initialArrayItems);
        
            // Effect to update arrayItems when the length changes
            useEffect(() => {
                // Only reset arrayItems if the length actually changes to avoid unnecessary re-renders
                if (arrayItems.length !== fieldObject.length) {
                    setArrayItems(Array.from({ length: fieldObject.length }, () => ({})));
                }
            }, [fieldObject.length]); // Dependency on fieldObject.length
        
            // Handle change: propagate up instead of managing locally
            const handleChangeArrayItem = (index, newValue) => {
                const updatedArrayItems = [...arrayItems];
                updatedArrayItems[index] = newValue;
                setArrayItems(updatedArrayItems);  // Update local state to trigger re-render
                onChange({...formValues, [fieldName]: updatedArrayItems}); // Propagate changes up
            };
        
            return (
                <div className='array-container'>
                    {arrayItems.map((item, index) => (
                        <div key={index} className='array-item'>
                            <label className='array-field-label'>{`${index}: <${fieldObject.elementType?.typeName}>`}</label>
                            <RecursiveFieldRenderer
                                fieldObject={fieldObject.elementType}
                                formValues={item}
                                onChange={(newValue) => handleChangeArrayItem(index, newValue)}
                                nodeId={nodeId}
                                fieldPath={generatePath(fieldPath, item.index, 'array')}
                                fromType = {'arrayField'}

                            />
                        </div>
                    ))}
                </div>
            );

            case 'tuple':
                const handleTupleChange = (index, newValue) => {
                    // Create a new copy of the tupleItems with updated value at the specified index
                    const updatedTupleItems = [...formValues[fieldName] || []];
                    updatedTupleItems[index] = newValue;
            
                    // Update the tuple in the main form values object
                    onChange({...formValues, [fieldName]: updatedTupleItems});
                };
            
                console.log('RecursiveFieldRenderer - tuple:', fieldObject);
                return (
                    <div className="tuple-container">
                        {fieldObject.elements.map((element, index) => {
                            return (
                                <div key={index} className="tuple-item">
                                    <label className='font-semibold'>{`Element ${index}: <${element.resolvedType.typeName || element.type}>`}</label>
                                    <RecursiveFieldRenderer
                                        fieldObject={element.resolvedType}
                                        formValues={(formValues?.[fieldName] || [])[index]}
                                        onChange={(newValue) => handleTupleChange(index, newValue)}
                                        nodeId={nodeId}
                                        fieldPath={generatePath(fieldPath, element.name, 'tuple')}
                                        fromType={'tuple'}

                                    />
                                </div>
                            );
                        })}
                    </div>
                );
                
            case 'tupleElement':  // This case might be similar to how fields within composites are handled
                console.log('RecursiveFieldRenderer - tupleElement:', fieldObject);
                // Assume tuple elements behave similarly to fields, potentially wrapping additional logic or styling if needed
                return (
                    <RecursiveFieldRenderer
                        fieldObject={fieldObject.resolvedType}
                        formValues={formValues}
                        onChange={onChange}
                        nodeId={nodeId}
                        fieldName={fieldName}
                        />
                    );
            

                    default:
                        console.log('RecursiveFieldRenderer - default:', fieldObject);
                        return <div key={fieldName}>Unsupported field type: {fieldType}</div>;
                }
            };
                
        export default RecursiveFieldRenderer;


import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { line2key } from '../utils';
import LinesConfiguratorRow from './LinesConfiguratorRow';
import LineConfigurator from './LineConfigurator';


const defaultLine = {
  config: {
    color: '#ABCDEF',
    isVisible: true
  }
};

const checkErrors = (line = defaultLine, isNewLine, targetLineKey, lines) => {
  const hasSameLine = isNewLine ?
    lines.some((l) => line2key(l) === line2key(line)) :
    (targetLineKey !== line2key(line) && lines.some((l) => line2key(l) === line2key(line)));

  return {
    resultIdNone: !Number.isInteger(line.resultId),
    logKeyNone: !line.logKey,
    hasSameLine
  };
};

const hasError = (errors = {}) => {
  const { resultIdNone, logKeyNone, hasSameLine } = errors;
  return resultIdNone || logKeyNone || hasSameLine;
};


class LinesConfigurator extends React.Component {
  constructor() {
    super();

    this.handleModalToggle = this.handleModalToggle.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleEditingLineChange = this.handleEditingLineChange.bind(this);
    this.handleAxisConfigLineAdd = this.handleAxisConfigLineAdd.bind(this);
    this.handleAxisConfigLineRemove = this.handleAxisConfigLineRemove.bind(this);
    this.handleLineVisibilityUpdate = this.handleLineVisibilityUpdate.bind(this);

    this.state = {
      showModal: false,
      showError: false,
      editingLine: defaultLine,
      isNewLine: true
    };
  }

  handleModalToggle() {
    if (this.state.showModal) {
      this.handleModalClose();
    } else {
      this.handleModalOpen();
    }
  }

  handleModalOpen(line = defaultLine) {
    this.setState({
      showModal: true,
      showError: false,
      targetLineKey: line2key(line),
      editingLine: line,
      isNewLine: (line === defaultLine),
      errors: {}
    });
  }

  handleModalClose() {
    this.setState({
      showModal: false
    });
  }

  handleEditingLineChange(newLine) {
    const { lines } = this.props;
    const { isNewLine, targetLineKey } = this.state;
    const errors = checkErrors(newLine, isNewLine, targetLineKey, lines);

    this.setState({
      editingLine: newLine,
      errors
    });
  }

  handleAxisConfigLineAdd() {
    const {
      axisName,
      onAxisConfigLineAdd, onAxisConfigLineUpdate,
      lines
    } = this.props;
    const { targetLineKey, editingLine, isNewLine } = this.state;
    const errors = checkErrors(editingLine, isNewLine, targetLineKey, lines);

    if (hasError(errors)) {
      this.setState({ showError: true, errors });
    } else {
      if (isNewLine) {
        onAxisConfigLineAdd(axisName, editingLine);
      } else {
        onAxisConfigLineUpdate(axisName, targetLineKey, editingLine);
      }
      this.handleModalClose();
    }
  }

  handleAxisConfigLineRemove(lineKey) {
    const { axisName, onAxisConfigLineRemove } = this.props;
    onAxisConfigLineRemove(axisName, lineKey);
  }

  handleLineVisibilityUpdate(targetLineKey, line) {
    const { axisName, onAxisConfigLineUpdate } = this.props;
    onAxisConfigLineUpdate(axisName, targetLineKey, line);
  }

  render() {
    const { results, lines = [] } = this.props;
    const { editingLine, isNewLine, errors, showError } = this.state;

    const lineConfiguratorElems = lines.map((line) => {
      const result = results[line.resultId] || {};

      return (
        <LinesConfiguratorRow
          line={line}
          result={result}
          onEditClick={this.handleModalOpen}
          onRemove={this.handleAxisConfigLineRemove}
          onVisibilityUpdate={this.handleLineVisibilityUpdate}
          key={line2key(line)}
        />
      );
    });

    return (
      <div className="list-group list-group-flush">
        {lineConfiguratorElems}
        <div className="list-group-item text-right">
          <Button color="primary" onClick={this.handleModalToggle}>Add</Button>

          <Modal isOpen={this.state.showModal} toggle={this.handleModalToggle} className="">
            <ModalHeader toggle={this.handleModalToggle}>{isNewLine ? 'Add a line' : 'Edit a line'}</ModalHeader>
            <ModalBody>
              <LineConfigurator
                results={results}
                line={editingLine}
                errors={showError ? errors : {}}
                onChange={this.handleEditingLineChange}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.handleModalToggle}>Cancel</Button>{' '}
              <Button
                color="primary"
                onClick={this.handleAxisConfigLineAdd}
                disabled={hasError(showError ? errors : {})}
              >{isNewLine ? 'Add' : 'Save'}</Button>
            </ModalFooter>
          </Modal>

        </div>
      </div>
    );
  }
}

LinesConfigurator.propTypes = {
  results: PropTypes.objectOf(PropTypes.any).isRequired,
  axisName: PropTypes.string.isRequired,
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      resultId: PropTypes.number,
      logKey: PropTypes.string
    })
  ),
  onAxisConfigLineAdd: PropTypes.func.isRequired,
  onAxisConfigLineUpdate: PropTypes.func.isRequired,
  onAxisConfigLineRemove: PropTypes.func.isRequired
};

LinesConfigurator.defaultProps = {
  lines: []
};

export default LinesConfigurator;

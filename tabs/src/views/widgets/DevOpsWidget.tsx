import React, { CSSProperties } from "react";

import { Button, Spinner, Text } from "@fluentui/react-components";
import {
    CodeTextEdit20Filled,
    MoreHorizontal32Regular,
    Search12Regular,
    Search24Filled,
} from "@fluentui/react-icons";

import { TeamsFxContext } from "../../internal/context";
import { DevOpsModel } from "../../models/devOpsModel";
import { DevOpsSearch } from "../../services/devopsService";
import { EmptyThemeImg } from "../components/EmptyThemeImg";
import { Widget } from "../lib/Widget";
import { widgetStyle } from "../lib/Widget.styles";
import { emptyLayout, emptyTextStyle, widgetPaddingStyle } from "../styles/Common.styles";

interface ITaskState {
    tasks?: DevOpsModel[];
    inputFocused?: boolean;
    addBtnOver?: boolean;
}

export class DevOps extends Widget<ITaskState> {
    inputDivRef;
    btnRef;
    inputRef;

    constructor(props: any) {
        super(props);
        this.inputRef = React.createRef<HTMLInputElement>();
        this.inputDivRef = React.createRef<HTMLDivElement>();
        this.btnRef = React.createRef<HTMLButtonElement>();
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    protected async getData(): Promise<ITaskState> {
        return {
            inputFocused: false,
            addBtnOver: false,
        };
    }

    protected headerContent(): JSX.Element | undefined {
        return (
            <div className={widgetStyle.headerContent}>
                <CodeTextEdit20Filled />
                <Text key="text-task-title" className={widgetStyle.headerText}>
                    DevOps Work Items Search
                </Text>
                <Button
                    key="bt-task-more"
                    icon={<MoreHorizontal32Regular />}
                    appearance="transparent"
                />
            </div>
        );
    }

    protected bodyContent(): JSX.Element | undefined {
        const hasTask = this.state.tasks?.length !== 0;
        return (
            <div>
                <TeamsFxContext.Consumer>
                    {({ themeString }) => this.inputLayout(themeString)}
                </TeamsFxContext.Consumer>

                {hasTask ? (
                    this.state.tasks?.map((item: DevOpsModel) => {
                        return (
                            <TeamsFxContext.Consumer
                                key={`consumer-task-${item.properties[0].Title}`}
                            >
                                {({ themeString }) => (
                                    <div key={`div-task-${item.properties[0].Title}`}>
                                        {item.properties[0].Title}
                                    </div>
                                )}
                            </TeamsFxContext.Consumer>
                        );
                    })
                ) : (
                    <div style={emptyLayout}>
                        <EmptyThemeImg key="img-empty" />
                        <Text key="text-empty" weight="semibold" style={emptyTextStyle}>
                            Open AI Code Helper will answer your questions here
                        </Text>
                    </div>
                )}
            </div>
        );
    }

    protected loadingContent(): JSX.Element | undefined {
        return (
            <div style={{ display: "grid" }}>
                <Spinner label="Loading..." labelPosition="below" />
            </div>
        );
    }

    private inputLayout(themeString: string): JSX.Element | undefined {
        return (
            <div ref={this.inputDivRef}>
                {this.state.inputFocused ? <Search12Regular /> : <Search24Filled />}

                <input
                    ref={this.inputRef}
                    type="text"
                    onFocus={() => this.inputFocusedState()}
                    placeholder="Search DevOps Work Items"
                />

                {this.state.inputFocused && (
                    <button
                        onClick={() => {
                            this.onAddButtonClick();
                        }}
                        onMouseEnter={() => this.mouseEnterState()}
                        onMouseLeave={() => this.mouseLeaveState()}
                    >
                        Ask
                    </button>
                )}
            </div>
        );
    }

    customiseWidgetStyle(): CSSProperties | undefined {
        return widgetPaddingStyle;
    }

    async componentDidMount() {
        super.componentDidMount();
        document.addEventListener("mousedown", this.handleClickOutside);
    }

    componentWillUnmount(): void {
        document.removeEventListener("mousedown", this.handleClickOutside);
    }

    private handleClickOutside(event: any) {
        if (!this.inputDivRef.current?.contains(event.target)) {
            this.setState({
                tasks: this.state.tasks,
                inputFocused: false,
                addBtnOver: this.state.addBtnOver,
                loading: false,
            });
        }
    }

    private onAddButtonClick = async () => {
        if (this.inputRef.current && this.inputRef.current.value.length > 0) {
            const tasks: DevOpsModel[] = await DevOpsSearch(this.inputRef.current.value);
            this.setState({
                tasks: tasks,
                inputFocused: false,
                addBtnOver: false,
                loading: false,
            });
            this.inputRef.current.value = "";
        }
    };

    private inputFocusedState = () => {
        this.setState({
            tasks: this.state.tasks,
            inputFocused: true,
            addBtnOver: this.state.addBtnOver,
            loading: false,
        });
    };

    private mouseEnterState = () => {
        this.setState({
            tasks: this.state.tasks,
            inputFocused: this.state.inputFocused,
            addBtnOver: true,
            loading: false,
        });
    };

    private mouseLeaveState = () => {
        this.setState({
            tasks: this.state.tasks,
            inputFocused: this.state.inputFocused,
            addBtnOver: false,
            loading: false,
        });
    };
}
